import mongoose from 'mongoose';
import { Client } from 'ssh2';
import dotenv from 'dotenv';

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

    console.log("Connecting to VPS via SSH...");
    const conn = new Client();
    conn.on('ready', () => {
        console.log("Connected! Running diagnostic commands...");

        const diagnosticCmds = [
            'echo "=== /var/www/ Contents ==="',
            'ls -la /var/www',
            'echo ""',
            'echo "=== Deployed Nginx Config ==="',
            'sudo cat /etc/nginx/sites-available/fashion.cloudedata.com.conf',
            'echo ""',
            'echo "=== Nginx sites-available ==="',
            'ls -la /etc/nginx/sites-available',
            'echo ""',
            'echo "=== Nginx sites-enabled ==="',
            'ls -la /etc/nginx/sites-enabled',
            'echo ""',
            'echo "=== Nginx config test ==="',
            'sudo nginx -t',
            'echo ""',
            'echo "=== Nginx error log (last 20 lines) ==="',
            'sudo tail -n 20 /var/log/nginx/error.log'
        ].join(' && ');

        conn.exec(diagnosticCmds, (execErr, stream) => {
            if (execErr) {
                console.error("Execution Error:", execErr);
                conn.end();
                process.exit(1);
            }
            stream.on('close', (code) => {
                console.log(`Diagnostics finished with code: ${code}`);
                conn.end();
                mongoose.disconnect();
                process.exit(0);
            }).on('data', (data) => {
                process.stdout.write(data.toString());
            });
            stream.stderr.on('data', (data) => {
                process.stderr.write(data.toString());
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
