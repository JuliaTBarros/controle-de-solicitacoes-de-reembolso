import {PrismaClient} from '@prisma/client';
import {PrismaLibSql} from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

beforeAll(async () => {
    const adapter = new PrismaLibSql({url: process.env.DATABASE_URL!});
    const prisma = new PrismaClient({adapter} as any);

    const hash = (pw: string) => bcrypt.hash(pw, 10);

    const users = [
        {nome: 'Colaborador Teste', email: 'colaborador@test.com', perfil: 'COLABORADOR'},
        {nome: 'Colaborador2 Teste', email: 'colaborador2@test.com', perfil: 'COLABORADOR'},
        {nome: 'Gestor Teste', email: 'gestor@test.com', perfil: 'GESTOR'},
        {nome: 'Financeiro Teste', email: 'financeiro@test.com', perfil: 'FINANCEIRO'},
        {nome: 'Admin Teste', email: 'admin@test.com', perfil: 'ADMIN'},
    ];

    for (const user of users) {
        await (prisma as any).usuario.upsert({
            where: {email: user.email},
            update: {},
            create: {...user, senha: await hash('123456')},
        });
    }

    const categories = [
        'Alimentação',
        'Transporte',
        'Hospedagem',
        'Material de escritório',
        'Treinamento',
    ];

    for (const nome of categories) {
        await (prisma as any).categoria.upsert({
            where: {nome},
            update: {},
            create: {nome},
        });
    }

    await prisma.$disconnect();
});
