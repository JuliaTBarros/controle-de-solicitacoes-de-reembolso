-- CreateTable
CREATE TABLE "Usuario"
(
    "id"          INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome"        TEXT     NOT NULL,
    "email"       TEXT     NOT NULL,
    "senha"       TEXT     NOT NULL,
    "perfil"      TEXT     NOT NULL DEFAULT 'COLABORADOR',
    "criadoEm"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atulizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SolicitacaoDeReembolso"
(
    "id"                    INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solicitanteId"         INTEGER  NOT NULL,
    "categoriaId"           INTEGER  NOT NULL,
    "descricao"             TEXT     NOT NULL,
    "valor"                 REAL     NOT NULL,
    "dataDespesa"           DATETIME NOT NULL,
    "status"                TEXT     NOT NULL DEFAULT 'RASCUNHO',
    "justificativaRejeicao" TEXT,
    "criadoEm"              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atulizadoEm"           DATETIME NOT NULL,
    CONSTRAINT "SolicitacaoDeReembolso_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SolicitacaoDeReembolso_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Categoria"
(
    "id"          INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome"        TEXT     NOT NULL,
    "ativo"       BOOLEAN  NOT NULL DEFAULT true,
    "criadoEm"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atulizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Anexo"
(
    "id"            INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solicitacaoId" INTEGER  NOT NULL,
    "nomeArquivo"   TEXT     NOT NULL,
    "urlArquivo"    TEXT     NOT NULL,
    "tipoArquivo"   TEXT     NOT NULL,
    "criadoEm"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Anexo_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "SolicitacaoDeReembolso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricoDaSolicitacao"
(
    "id"            INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solicitacaoId" INTEGER  NOT NULL,
    "usuarioId"     INTEGER  NOT NULL,
    "acao"          TEXT     NOT NULL,
    "observacao"    TEXT,
    "criadoEm"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoDaSolicitacao_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "SolicitacaoDeReembolso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HistoricoDaSolicitacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario" ("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria" ("nome");
