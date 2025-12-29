-- CreateTable
CREATE TABLE "FaultMaster" (
    "id" SERIAL NOT NULL,
    "faultCode" TEXT NOT NULL,
    "displayCode" TEXT,
    "faultName" TEXT NOT NULL,
    "faultContent" TEXT,
    "solution" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaultMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorStatus" (
    "id" SERIAL NOT NULL,
    "sensorCode" TEXT NOT NULL,
    "sensorName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FaultMaster_faultCode_key" ON "FaultMaster"("faultCode");

-- CreateIndex
CREATE INDEX "FaultMaster_faultCode_idx" ON "FaultMaster"("faultCode");

-- CreateIndex
CREATE INDEX "FaultMaster_displayCode_idx" ON "FaultMaster"("displayCode");

-- CreateIndex
CREATE INDEX "FaultMaster_faultName_idx" ON "FaultMaster"("faultName");

-- CreateIndex
CREATE UNIQUE INDEX "SensorStatus_sensorCode_key" ON "SensorStatus"("sensorCode");

-- CreateIndex
CREATE INDEX "SensorStatus_sensorCode_idx" ON "SensorStatus"("sensorCode");

-- CreateIndex
CREATE INDEX "SensorStatus_sensorName_idx" ON "SensorStatus"("sensorName");
