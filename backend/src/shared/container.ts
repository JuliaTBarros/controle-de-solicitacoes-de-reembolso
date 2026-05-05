import {PrismaReembolsoRepository}  from '../infrastructure/database/prisma/repositories/PrismaReembolsoRepository';
import {PrismaUsuarioRepository}    from '../infrastructure/database/prisma/repositories/PrismaUsuarioRepository';
import {PrismaCategoriaRepository}  from '../infrastructure/database/prisma/repositories/PrismaCategoriaRepository';
import {PrismaHistoricoRepository}  from '../infrastructure/database/prisma/repositories/PrismaHistoricoRepository';
import {PrismaAnexoRepository}      from '../infrastructure/database/prisma/repositories/PrismaAnexoRepository';
import {JwtTokenService}            from '../infrastructure/auth/JwtTokenService';
import {BcryptHashService}          from '../infrastructure/auth/BcryptHashService';
import {LoginUseCase}               from '../application/use-cases/auth/LoginUseCase';
import {RegistroUsuarioUseCase}     from '../application/use-cases/auth/RegistroUsuarioUseCase';
import {CriarReembolsoUseCase}      from '../application/use-cases/reembolso/CriarReembolsoUseCase';
import {AtualizarReembolsoUseCase}  from '../application/use-cases/reembolso/AtualizarReembolsoUseCase';
import {EnviarReembolsoUseCase}     from '../application/use-cases/reembolso/EnviarReembolsoUseCase';
import {CancelarReembolsoUseCase}   from '../application/use-cases/reembolso/CancelarReembolsoUseCase';
import {AprovarReembolsoUseCase}    from '../application/use-cases/reembolso/AprovarReembolsoUseCase';
import {RejeitarReembolsoUseCase}   from '../application/use-cases/reembolso/RejeitarReembolsoUseCase';
import {PagarReembolsoUseCase}      from '../application/use-cases/reembolso/PagarReembolsoUseCase';
import {ListarReembolsosUseCase}    from '../application/use-cases/reembolso/ListarReembolsosUseCase';
import {GetReembolsoByIdUseCase}    from '../application/use-cases/reembolso/GetReembolsoByIdUseCase';
import {ListarHistoricoUseCase}     from '../application/use-cases/reembolso/ListarHistoricoUseCase';
import {CriarAnexoUseCase}          from '../application/use-cases/reembolso/CriarAnexoUseCase';
import {ListarAnexosUseCase}        from '../application/use-cases/reembolso/ListarAnexosUseCase';
import {CriarCategoriaUseCase}      from '../application/use-cases/categoria/CriarCategoriaUseCase';
import {AtualizarCategoriaUseCase}  from '../application/use-cases/categoria/AtualizarCategoriaUseCase';
import {ListarCategoriasUseCase}    from '../application/use-cases/categoria/ListarCategoriasUseCase';
import {ListarUsuariosUseCase}      from '../application/use-cases/usuario/ListarUsuariosUseCase';

function construirContainer() {
    const repositorioUsuario    = new PrismaUsuarioRepository();
    const repositorioCategoria  = new PrismaCategoriaRepository();
    const repositorioReembolso  = new PrismaReembolsoRepository();
    const repositorioHistorico  = new PrismaHistoricoRepository();
    const repositorioAnexo      = new PrismaAnexoRepository();
    const servicoDeHash         = new BcryptHashService();
    const servicoDeToken        = new JwtTokenService();

    return {
        servicoDeToken,

        loginUseCase:                new LoginUseCase(repositorioUsuario, servicoDeHash, servicoDeToken),
        registroUsuarioUseCase:      new RegistroUsuarioUseCase(repositorioUsuario, servicoDeHash),

        criarReembolsoUseCase:       new CriarReembolsoUseCase(repositorioReembolso, repositorioCategoria, repositorioHistorico),
        atualizarReembolsoUseCase:   new AtualizarReembolsoUseCase(repositorioReembolso, repositorioCategoria, repositorioHistorico),
        enviarReembolsoUseCase:      new EnviarReembolsoUseCase(repositorioReembolso, repositorioHistorico),
        cancelarReembolsoUseCase:    new CancelarReembolsoUseCase(repositorioReembolso, repositorioHistorico),
        aprovarReembolsoUseCase:     new AprovarReembolsoUseCase(repositorioReembolso, repositorioHistorico),
        rejeitarReembolsoUseCase:    new RejeitarReembolsoUseCase(repositorioReembolso, repositorioHistorico),
        pagarReembolsoUseCase:       new PagarReembolsoUseCase(repositorioReembolso, repositorioHistorico),
        listarReembolsosUseCase:     new ListarReembolsosUseCase(repositorioReembolso),
        buscarReembolsoPorIdUseCase: new GetReembolsoByIdUseCase(repositorioReembolso),
        listarHistoricoUseCase:      new ListarHistoricoUseCase(repositorioReembolso, repositorioHistorico),
        criarAnexoUseCase:           new CriarAnexoUseCase(repositorioReembolso, repositorioAnexo),
        listarAnexosUseCase:         new ListarAnexosUseCase(repositorioReembolso, repositorioAnexo),

        criarCategoriaUseCase:       new CriarCategoriaUseCase(repositorioCategoria),
        atualizarCategoriaUseCase:   new AtualizarCategoriaUseCase(repositorioCategoria),
        listarCategoriasUseCase:     new ListarCategoriasUseCase(repositorioCategoria),

        listarUsuariosUseCase:       new ListarUsuariosUseCase(repositorioUsuario),
    };
}

type ContainerInstance = ReturnType<typeof construirContainer>;

let _instancia: ContainerInstance | null = null;

export function getContainer(): ContainerInstance {
    if (!_instancia) _instancia = construirContainer();
    return _instancia;
}
