import mongoose from 'mongoose';
import { Client } from 'ssh2';
import dotenv from 'dotenv';
import { exec, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

dotenv.config();

const platformSettingSchema = new mongoose.Schema({
    expectedStoreIP: String,
    sshUser: String,
    sshPassword: { type: String, default: '' }
}, { collection: 'platformsettings' });

const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);

async function run() {
    console.log("Connecting to MongoDB to get VPS credentials...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected.");

    const settings = await PlatformSetting.findOne();
    if (!settings) {
        console.error("No PlatformSettings found!");
        process.exit(1);
    }

    const { expectedStoreIP, sshUser, sshPassword } = settings;
    console.log(`VPS target: ${sshUser}@${expectedStoreIP}`);

    const frontendPath = path.resolve(process.cwd(), '../../admin-frontend');
    console.log(`Building frontend locally from: ${frontendPath}...`);

    await new Promise((resolve, reject) => {
        exec('npm run build', {
            cwd: frontendPath,
            env: {
                ...process.env,
                VITE_API_BASE_URL: '/api',
                VITE_STORE_API_URL: '/api',
                VITE_AUTH_API_URL: '/api/auth',
                VITE_MERCHANT_ADMIN_API_URL: '/api/admin',
                VITE_ADMIN_API_URL: '/api/admin',
                VITE_CATALOG_API_URL: '/api',
                VITE_BILLING_API_URL: '/api/billing'
            }
        }, (err, stdout, stderr) => {
            if (err) {
                console.error("Build failed:", err);
                return reject(err);
            }
            console.log("Local build succeeded!");
            resolve();
        });
    });

    const archiveName = 'shared-dist.tar.gz';
    console.log(`Compressing built files to ${archiveName} (excluding MP4s)...`);
    execSync(`tar --exclude="*.mp4" -czf "${archiveName}" -C "${frontendPath}/dist" .`);
    console.log("Compression done.");

    console.log("Connecting to VPS via SSH...");
    const conn = new Client();
    conn.on('ready', () => {
        console.log("Connected! Starting SFTP upload...");
        conn.sftp((err, sftp) => {
            if (err) {
                console.error("SFTP Error:", err);
                conn.end();
                process.exit(1);
            }

            const remoteArchivePath = `/tmp/${archiveName}`;
            console.log(`Checking/cleaning remote archive path: ${remoteArchivePath}`);
            
            sftp.unlink(remoteArchivePath, () => {
                console.log("Starting SFTP upload...");
                sftp.fastPut(archiveName, remoteArchivePath, {
                    concurrency: 64,
                    chunkSize: 262144,
                    step: (transferred, chunk, total) => {
                        const pct = Math.round((transferred / total) * 100);
                        if (pct % 20 === 0) {
                            console.log(`[Main Archive] Uploading: ${pct}% (${(transferred / 1024 / 1024).toFixed(2)} MB / ${(total / 1024 / 1024).toFixed(2)} MB)`);
                        }
                    }
                }, (uploadErr) => {
                    if (uploadErr) {
                        console.error("Upload Error:", uploadErr);
                        conn.end();
                        process.exit(1);
                    }
                    console.log("SFTP Upload completed.");

                const sharedWebRoot = '/var/www/admin-frontend/dist';
                const deployCmds = [
                    `sudo mkdir -p ${sharedWebRoot}`,
                    `sudo tar -xzf ${remoteArchivePath} -C ${sharedWebRoot}`,
                    `sudo rm -f ${remoteArchivePath}`,
                    `sudo chmod -R 755 /var/www/admin-frontend`
                ].join(' && ');

                console.log("Extracting archive on VPS...");
                conn.exec(deployCmds, (execErr, stream) => {
                    if (execErr) {
                        console.error("Execution Error:", execErr);
                        conn.end();
                        process.exit(1);
                    }
                    stream.on('close', (code) => {
                        console.log(`Commands finished with code: ${code}`);
                        if (code !== 0) {
                            console.error(`Deployment failed with code: ${code}`);
                            conn.end();
                            mongoose.disconnect();
                            process.exit(code);
                        }
                        
                        // Clean up local zip
                        try {
                            fs.unlinkSync(archiveName);
                        } catch (e) {}

                        console.log("Shared frontend core deployed successfully on VPS!");
                        
                        // Start background upload of MP4 files
                        const assetsDir = path.join(frontendPath, 'dist', 'assets');
                        let mp4Files = [];
                        try {
                            mp4Files = fs.readdirSync(assetsDir).filter(file => file.endsWith('.mp4'));
                        } catch (readErr) {
                            console.log("No assets directory or could not read files:", readErr.message);
                        }

                        if (mp4Files.length === 0) {
                            console.log("No MP4 files to upload. Deployment complete!");
                            conn.end();
                            mongoose.disconnect();
                            process.exit(0);
                        }

                        console.log(`Found ${mp4Files.length} MP4 file(s) to upload in the background...`);
                        
                        let uploadIndex = 0;
                        const uploadNextMp4 = () => {
                            if (uploadIndex >= mp4Files.length) {
                                console.log("All background videos uploaded successfully!");
                                conn.end();
                                mongoose.disconnect();
                                process.exit(0);
                            }
                            const mp4File = mp4Files[uploadIndex];
                            const localMp4Path = path.join(assetsDir, mp4File);
                            const remoteMp4Path = `${sharedWebRoot}/assets/${mp4File}`;
                            console.log(`[Video Uploader] Uploading video ${uploadIndex + 1}/${mp4Files.length}: ${mp4File}...`);
                            
                            let lastLoggedPct = -10;
                            sftp.fastPut(localMp4Path, remoteMp4Path, {
                                concurrency: 64,
                                chunkSize: 262144,
                                step: (transferred, chunk, total) => {
                                    const pct = Math.round((transferred / total) * 100);
                                    if (pct >= lastLoggedPct + 10 || pct === 100) {
                                        lastLoggedPct = Math.floor(pct / 10) * 10;
                                        console.log(`[Video Uploader] ${mp4File}: ${pct}% (${(transferred / 1024 / 1024).toFixed(2)} MB / ${(total / 1024 / 1024).toFixed(2)} MB)`);
                                    }
                                }
                            }, (err) => {
                                if (err) {
                                    console.error(`[Video Uploader] Failed to upload ${mp4File}:`, err.message);
                                } else {
                                    console.log(`[Video Uploader] Successfully uploaded ${mp4File}`);
                                }
                                uploadIndex++;
                                uploadNextMp4();
                            });
                        };
                        
                        uploadNextMp4();

                    }).on('data', (data) => {
                        process.stdout.write(data.toString());
                    });
                    stream.stderr.on('data', (data) => {
                        process.stderr.write(data.toString());
                    });
                });
            });
        });
    });
}).on('error', (err) => {
        console.error("SSH Connection Error:", err);
        process.exit(1);
    }).connect({
        host: expectedStoreIP,
        port: 22,
        username: sshUser,
        password: sshPassword,
        readyTimeout: 20000
    });
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
