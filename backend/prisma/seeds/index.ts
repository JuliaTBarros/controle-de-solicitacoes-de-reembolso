import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  for (const user of [
    { name: 'Colaborador Teste', email: 'colaborador@test.com', password: await hash('123456'), role: 'COLABORADOR' },
    { name: 'Gestor Teste',      email: 'gestor@test.com',      password: await hash('123456'), role: 'GESTOR' },
    { name: 'Financeiro Teste',  email: 'financeiro@test.com',  password: await hash('123456'), role: 'FINANCEIRO' },
    { name: 'Admin Teste',       email: 'admin@test.com',       password: await hash('123456'), role: 'ADMIN' },
  ]) {
    await prisma.user.upsert({ where: { email: user.email }, update: {}, create: user });
  }

  for (const category of [
    { name: 'Alimentação' },
    { name: 'Transporte' },
    { name: 'Hospedagem' },
    { name: 'Material de escritório' },
    { name: 'Treinamento' },
  ]) {
    await prisma.category.upsert({ where: { name: category.name }, update: {}, create: category });
  }

  console.log('Seed concluído.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
