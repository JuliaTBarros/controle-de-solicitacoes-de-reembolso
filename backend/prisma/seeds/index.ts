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
        await prisma.categoria.upsert({
            where: {nome: category.nome},
            update: {},
            create: category
        });
    }

    const jaExistemSolicitacoes = await prisma.solicitacaoDeReembolso.count();
    if (jaExistemSolicitacoes > 0) {
        console.log('Solicitações já existem, pulando criação de dados fictícios.');
        console.log('Seed concluído.');
        return;
    }

    const colaborador = await prisma.usuario.findUniqueOrThrow({where: {email: 'colaborador@test.com'}});
    const gestor = await prisma.usuario.findUniqueOrThrow({where: {email: 'gestor@test.com'}});
    const financeiro = await prisma.usuario.findUniqueOrThrow({where: {email: 'financeiro@test.com'}});

    const catAlimentacao = await prisma.categoria.findUniqueOrThrow({where: {nome: 'Alimentação'}});
    const catTransporte = await prisma.categoria.findUniqueOrThrow({where: {nome: 'Transporte'}});
    const catHospedagem = await prisma.categoria.findUniqueOrThrow({where: {nome: 'Hospedagem'}});
    const catMaterial = await prisma.categoria.findUniqueOrThrow({where: {nome: 'Material de escritório'}});
    const catTreinamento = await prisma.categoria.findUniqueOrThrow({where: {nome: 'Treinamento'}});

    // 1. RASCUNHO — apenas criada, sem envio
    const rascunho = await prisma.solicitacaoDeReembolso.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: catAlimentacao.id,
            descricao: 'Almoço com cliente durante reunião comercial',
            valor: 87.50,
            dataDespesa: new Date('2026-04-10'),
            status: 'RASCUNHO',
        },
    });
    await prisma.anexo.create({
        data: {
            solicitacaoId: rascunho.id,
            nomeArquivo: 'nota_fiscal_almoco.pdf',
            urlArquivo: 'https://storage.empresa.com/anexos/nota_fiscal_almoco.pdf',
            tipoArquivo: 'application/pdf',
        },
    });
    await prisma.historicoDaSolicitacao.create({
        data: {
            solicitacaoId: rascunho.id,
            usuarioId: colaborador.id,
            acao: 'CREATED',
            observacao: 'Solicitação criada como rascunho.',
        },
    });

    // 2. ENVIADO — aguardando aprovação
    const enviado = await prisma.solicitacaoDeReembolso.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: catTransporte.id,
            descricao: 'Uber para visita ao cliente na sede do parceiro',
            valor: 45.90,
            dataDespesa: new Date('2026-04-15'),
            status: 'ENVIADO',
        },
    });
    await prisma.anexo.create({
        data: {
            solicitacaoId: enviado.id,
            nomeArquivo: 'recibo_uber.png',
            urlArquivo: 'https://storage.empresa.com/anexos/recibo_uber.png',
            tipoArquivo: 'image/png',
        },
    });
    await prisma.historicoDaSolicitacao.createMany({
        data: [
            {
                solicitacaoId: enviado.id,
                usuarioId: colaborador.id,
                acao: 'CREATED',
                observacao: 'Solicitação criada.',
            },
            {
                solicitacaoId: enviado.id,
                usuarioId: colaborador.id,
                acao: 'SUBMITTED',
                observacao: 'Solicitação enviada para aprovação.',
            },
        ],
    });

    // 3. APROVADO — aprovada pelo gestor
    const aprovado = await prisma.solicitacaoDeReembolso.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: catHospedagem.id,
            descricao: 'Hotel para viagem a congresso de tecnologia em São Paulo',
            valor: 520.00,
            dataDespesa: new Date('2026-03-20'),
            status: 'APROVADO',
        },
    });
    await prisma.anexo.createMany({
        data: [
            {
                solicitacaoId: aprovado.id,
                nomeArquivo: 'nota_hotel_marriott.pdf',
                urlArquivo: 'https://storage.empresa.com/anexos/nota_hotel_marriott.pdf',
                tipoArquivo: 'application/pdf',
            },
            {
                solicitacaoId: aprovado.id,
                nomeArquivo: 'confirmacao_reserva.pdf',
                urlArquivo: 'https://storage.empresa.com/anexos/confirmacao_reserva.pdf',
                tipoArquivo: 'application/pdf',
            },
        ],
    });
    await prisma.historicoDaSolicitacao.createMany({
        data: [
            {
                solicitacaoId: aprovado.id,
                usuarioId: colaborador.id,
                acao: 'CREATED',
                observacao: 'Solicitação criada.',
            },
            {
                solicitacaoId: aprovado.id,
                usuarioId: colaborador.id,
                acao: 'SUBMITTED',
                observacao: 'Solicitação enviada para aprovação.',
            },
            {
                solicitacaoId: aprovado.id,
                usuarioId: gestor.id,
                acao: 'APPROVED',
                observacao: 'Despesa dentro da política de viagens corporativas.',
            },
        ],
    });

    // 4. REJEITADO — rejeitada pelo gestor
    const rejeitado = await prisma.solicitacaoDeReembolso.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: catAlimentacao.id,
            descricao: 'Jantar de confraternização da equipe',
            valor: 310.00,
            dataDespesa: new Date('2026-04-02'),
            status: 'REJEITADO',
            justificativaRejeicao: 'Valor acima do limite permitido por pessoa para eventos sociais. Reenvie com o valor proporcional ao número de participantes.',
        },
    });
    await prisma.anexo.create({
        data: {
            solicitacaoId: rejeitado.id,
            nomeArquivo: 'nota_jantar.jpg',
            urlArquivo: 'https://storage.empresa.com/anexos/nota_jantar.jpg',
            tipoArquivo: 'image/jpeg',
        },
    });
    await prisma.historicoDaSolicitacao.createMany({
        data: [
            {
                solicitacaoId: rejeitado.id,
                usuarioId: colaborador.id,
                acao: 'CREATED',
                observacao: 'Solicitação criada.',
            },
            {
                solicitacaoId: rejeitado.id,
                usuarioId: colaborador.id,
                acao: 'SUBMITTED',
                observacao: 'Solicitação enviada para aprovação.',
            },
            {
                solicitacaoId: rejeitado.id,
                usuarioId: gestor.id,
                acao: 'REJECTED',
                observacao: 'Valor acima do limite permitido por pessoa para eventos sociais.',
            },
        ],
    });

    // 5. PAGO — ciclo completo
    const pago = await prisma.solicitacaoDeReembolso.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: catTreinamento.id,
            descricao: 'Inscrição no curso de certificação AWS Solutions Architect',
            valor: 1200.00,
            dataDespesa: new Date('2026-02-28'),
            status: 'PAGO',
        },
    });
    await prisma.anexo.createMany({
        data: [
            {
                solicitacaoId: pago.id,
                nomeArquivo: 'comprovante_inscricao_aws.pdf',
                urlArquivo: 'https://storage.empresa.com/anexos/comprovante_inscricao_aws.pdf',
                tipoArquivo: 'application/pdf',
            },
            {
                solicitacaoId: pago.id,
                nomeArquivo: 'certificado_aws.pdf',
                urlArquivo: 'https://storage.empresa.com/anexos/certificado_aws.pdf',
                tipoArquivo: 'application/pdf',
            },
        ],
    });
    await prisma.historicoDaSolicitacao.createMany({
        data: [
            {
                solicitacaoId: pago.id,
                usuarioId: colaborador.id,
                acao: 'CREATED',
                observacao: 'Solicitação criada.',
            },
            {
                solicitacaoId: pago.id,
                usuarioId: colaborador.id,
                acao: 'SUBMITTED',
                observacao: 'Solicitação enviada para aprovação.',
            },
            {
                solicitacaoId: pago.id,
                usuarioId: gestor.id,
                acao: 'APPROVED',
                observacao: 'Treinamento alinhado com o plano de desenvolvimento individual do colaborador.',
            },
            {
                solicitacaoId: pago.id,
                usuarioId: financeiro.id,
                acao: 'PAID',
                observacao: 'Reembolso processado via transferência bancária.',
            },
        ],
    });

    // 6. CANCELADO — cancelado pelo próprio colaborador
    const cancelado = await prisma.solicitacaoDeReembolso.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: catMaterial.id,
            descricao: 'Compra de headset para home office',
            valor: 199.90,
            dataDespesa: new Date('2026-04-20'),
            status: 'CANCELADO',
        },
    });
    await prisma.anexo.create({
        data: {
            solicitacaoId: cancelado.id,
            nomeArquivo: 'nota_headset.pdf',
            urlArquivo: 'https://storage.empresa.com/anexos/nota_headset.pdf',
            tipoArquivo: 'application/pdf',
        },
    });
    await prisma.historicoDaSolicitacao.createMany({
        data: [
            {
                solicitacaoId: cancelado.id,
                usuarioId: colaborador.id,
                acao: 'CREATED',
                observacao: 'Solicitação criada.',
            },
            {
                solicitacaoId: cancelado.id,
                usuarioId: colaborador.id,
                acao: 'CANCELED',
                observacao: 'Empresa forneceu o equipamento diretamente.',
            },
        ],
    });

    // 7. Segundo ENVIADO — para enriquecer a listagem
    const enviado2 = await prisma.solicitacaoDeReembolso.create({
        data: {
            solicitanteId: colaborador.id,
            categoriaId: catTransporte.id,
            descricao: 'Passagem aérea para reunião com cliente em Porto Alegre',
            valor: 680.00,
            dataDespesa: new Date('2026-05-05'),
            status: 'ENVIADO',
        },
    });
    await prisma.anexo.create({
        data: {
            solicitacaoId: enviado2.id,
            nomeArquivo: 'eticket_latam.pdf',
            urlArquivo: 'https://storage.empresa.com/anexos/eticket_latam.pdf',
            tipoArquivo: 'application/pdf',
        },
    });
    await prisma.historicoDaSolicitacao.createMany({
        data: [
            {
                solicitacaoId: enviado2.id,
                usuarioId: colaborador.id,
                acao: 'CREATED',
                observacao: 'Solicitação criada.',
            },
            {
                solicitacaoId: enviado2.id,
                usuarioId: colaborador.id,
                acao: 'SUBMITTED',
                observacao: 'Solicitação enviada para aprovação.',
            },
        ],
    });

    console.log('Seed concluído com sucesso.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
