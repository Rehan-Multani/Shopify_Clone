/**
 * Load store-service/.env from the service root, not process.cwd().
 * `node src/server.js` from src/ must still find ../.env.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
    path.resolve(here, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
];
const envPath = candidates.find((p) => {
    try {
        return fs.existsSync(p);
    } catch {
        return false;
    }
});

if (envPath) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}
