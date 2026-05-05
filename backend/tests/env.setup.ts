import dotenv from 'dotenv';

dotenv.config();
process.env.DATABASE_URL = 'file:./prisma/test.db';
