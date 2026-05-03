-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COLABORADOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reimbursement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solicitanteId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "expenseDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reimbursement_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reimbursement_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solicitacaoId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Reimbursement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReimbursementHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "solicitacaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "observation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReimbursementHistory_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "Reimbursement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReimbursementHistory_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
