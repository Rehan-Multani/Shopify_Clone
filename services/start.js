import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const services = [
    { name: 'gateway', dir: './gateway', port: 5000 },
    { name: 'auth-service', dir: './auth-service', port: 5001 },
    { name: 'merchant-admin-service', dir: './merchant-admin-service', port: 5002 },
    { name: 'catalog-service', dir: './catalog-service', port: 5003 },
    { name: 'store-service', dir: './store-service', port: 5004 },
    { name: 'billing-service', dir: './billing-service', port: 5005 }
];

console.log('====================================================');
console.log('       Starting Storify Microservices Cluster       ');
console.log('====================================================\n');

services.forEach(service => {
    const cwd = path.resolve(__dirname, service.dir);
    
    // Launch child process npm run dev
    const child = spawn('npm', ['run', 'dev'], {
        cwd,
        shell: true
    });
    
    child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine) {
                console.log(`[${service.name}] ${cleanLine}`);
            }
        });
    });

    child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            const cleanLine = line.trim();
            if (cleanLine) {
                console.error(`[${service.name} ERROR] ${cleanLine}`);
            }
        });
    });
    
    child.on('error', (err) => {
        console.error(`[${service.name}] Failed to start:`, err);
    });
    
    console.log(`[+] Initialized ${service.name} (port ${service.port})`);
});
