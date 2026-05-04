import {PrismaClient} from '@prisma/client';
import {PrismaLibSql} from '@prisma/adapter-libsql';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaLibSql({url: process.env.DATABASE_URL!});
const prisma = new PrismaClient({adapter});

async function main() {
    const hash = (pw: string) => bcrypt.hash(pw, 10);

    for (const user of [
        {nome: 'Colaborador Teste', email: 'colaborador@test.com', senha: await hash('123456'), perfil: 'COLABORADOR'},
        {nome: 'Gestor Teste', email: 'gestor@test.com', senha: await hash('123456'), perfil: 'GESTOR'},
        {nome: 'Financeiro Teste', email: 'financeiro@test.com', senha: await hash('123456'), perfil: 'FINANCEIRO'},
        {nome: 'Admin Teste', email: 'admin@test.com', senha: await hash('123456'), perfil: 'ADMIN'},
    ]) {
        // Changed prisma.user to prisma.usuario
        await prisma.usuario.upsert({
            where: {email: user.email},
            update: {},
            create: user
        });
    }

    for (const category of [
        {nome: 'Alimentação'},
        {nome: 'Transporte'},
        {nome: 'Hospedagem'},
        {nome: 'Material de escritório'},
        {nome: 'Treinamento'},
    ]) {
        // Changed prisma.category to prisma.categoria and where clause to use 'nome'
        await prisma.categoria.upsert({
            where: {nome: category.nome},
            update: {},
            create: category
        });
    }

    console.log('Seed concluído.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());