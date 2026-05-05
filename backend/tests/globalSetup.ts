import {execSync} from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function globalSetup() {
    const testDbPath = path.resolve(__dirname, '../prisma/test.db');

    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
    }

    execSync('npx prisma migrate deploy', {
        cwd: path.resolve(__dirname, '..'),
        env: {...process.env, DATABASE_URL: 'file:./prisma/test.db'},
        stdio: 'pipe',
    });
}
