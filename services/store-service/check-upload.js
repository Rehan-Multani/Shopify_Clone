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
    await mongoose.connect(process.env.MONGODB_URL);
    const settings = await PlatformSetting.findOne();
    const { expectedStoreIP, sshUser, sshPassword } = settings;

    const conn = new Client();
    conn.on('ready', () => {
        conn.exec("ls -lh /tmp/shared-dist.tar.gz", (err, stream) => {
            if (err) {
                console.error(err);
                conn.end();
                process.exit(1);
            }
            stream.on('close', () => {
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
    }).connect({
        host: expectedStoreIP,
        port: 22,
        username: sshUser,
        password: sshPassword
    });
}

run().catch(console.error);
