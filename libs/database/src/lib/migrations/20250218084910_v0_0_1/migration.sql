-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('HYDROGEN_PRODUCER', 'POWER_PRODUCER');

-- CreateEnum
CREATE TYPE "BatchType" AS ENUM ('HYDROGEN', 'POWER');

-- CreateEnum
CREATE TYPE "PowerAccessApprovalStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "companyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalForm" TEXT NOT NULL,
    "mastNumber" TEXT NOT NULL,
    "companyType" "CompanyType" NOT NULL,
    "addressId" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "assetId" TEXT,
    "processStepId" TEXT,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PowerGenerationUnitType" (
    "name" TEXT NOT NULL,

    CONSTRAINT "PowerGenerationUnitType_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "PowerGenerationUnit" (
    "id" TEXT NOT NULL,
    "ratedPower" DECIMAL(65,30) NOT NULL,
    "gridOperator" TEXT NOT NULL,
    "gridLevel" TEXT NOT NULL,
    "gridConnectionNumber" TEXT NOT NULL,
    "energyName" TEXT NOT NULL,
    "generalInfoId" TEXT NOT NULL,

    CONSTRAINT "PowerGenerationUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElectrolysisType" (
    "name" TEXT NOT NULL,

    CONSTRAINT "ElectrolysisType_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "HydrogenGenerationUnit" (
    "id" TEXT NOT NULL,
    "ratedPower" DECIMAL(65,30) NOT NULL,
    "electrolysisTypeName" TEXT NOT NULL,
    "generalInfoId" TEXT NOT NULL,

    CONSTRAINT "HydrogenGenerationUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HydrogenStorageUnit" (
    "id" TEXT NOT NULL,
    "capacity" DECIMAL(65,30) NOT NULL,
    "generalInfoId" TEXT NOT NULL,

    CONSTRAINT "HydrogenStorageUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mastrNumber" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "commissionedOn" TIMESTAMP(3) NOT NULL,
    "decommissioningPlannedOn" TIMESTAMP(3) NOT NULL,
    "addressId" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnergySource" (
    "name" TEXT NOT NULL,

    CONSTRAINT "EnergySource_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "PowerAccessApproval" (
    "id" TEXT NOT NULL,
    "decidedAt" TIMESTAMP(3) NOT NULL,
    "powerAccessApprovalStatus" "PowerAccessApprovalStatus" NOT NULL,
    "energySourceName" TEXT NOT NULL,
    "hydrogenProducerId" TEXT NOT NULL,
    "powerProducerId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "PowerAccessApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "BatchType" NOT NULL,
    "hydrogenStorageUnitId" TEXT,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Process" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "processName" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletId_key" ON "User"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "PowerGenerationUnit_generalInfoId_key" ON "PowerGenerationUnit"("generalInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "HydrogenGenerationUnit_generalInfoId_key" ON "HydrogenGenerationUnit"("generalInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "HydrogenStorageUnit_generalInfoId_key" ON "HydrogenStorageUnit"("generalInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessStep_batchId_key" ON "ProcessStep"("batchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "ProcessStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerGenerationUnit" ADD CONSTRAINT "PowerGenerationUnit_energyName_fkey" FOREIGN KEY ("energyName") REFERENCES "PowerGenerationUnitType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerGenerationUnit" ADD CONSTRAINT "PowerGenerationUnit_generalInfoId_fkey" FOREIGN KEY ("generalInfoId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HydrogenGenerationUnit" ADD CONSTRAINT "HydrogenGenerationUnit_electrolysisTypeName_fkey" FOREIGN KEY ("electrolysisTypeName") REFERENCES "ElectrolysisType"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HydrogenGenerationUnit" ADD CONSTRAINT "HydrogenGenerationUnit_generalInfoId_fkey" FOREIGN KEY ("generalInfoId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HydrogenStorageUnit" ADD CONSTRAINT "HydrogenStorageUnit_generalInfoId_fkey" FOREIGN KEY ("generalInfoId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerAccessApproval" ADD CONSTRAINT "PowerAccessApproval_energySourceName_fkey" FOREIGN KEY ("energySourceName") REFERENCES "EnergySource"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerAccessApproval" ADD CONSTRAINT "PowerAccessApproval_hydrogenProducerId_fkey" FOREIGN KEY ("hydrogenProducerId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerAccessApproval" ADD CONSTRAINT "PowerAccessApproval_powerProducerId_fkey" FOREIGN KEY ("powerProducerId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerAccessApproval" ADD CONSTRAINT "PowerAccessApproval_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_hydrogenStorageUnitId_fkey" FOREIGN KEY ("hydrogenStorageUnitId") REFERENCES "HydrogenStorageUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_processName_fkey" FOREIGN KEY ("processName") REFERENCES "Process"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
