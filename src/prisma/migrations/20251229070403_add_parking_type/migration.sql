/*
  Warnings:

  - A unique constraint covering the columns `[sensorCode,parkingType]` on the table `SensorStatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `parkingType` to the `SensorStatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SensorStatus_sensorCode_key";

-- AlterTable
ALTER TABLE "FaultMaster" ADD COLUMN     "parkingType" TEXT NOT NULL DEFAULT 'タワーパーク';

-- AlterTable
ALTER TABLE "SensorStatus" ADD COLUMN     "parkingType" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "FaultMaster_parkingType_idx" ON "FaultMaster"("parkingType");

-- CreateIndex
CREATE INDEX "SensorStatus_parkingType_idx" ON "SensorStatus"("parkingType");

-- CreateIndex
CREATE UNIQUE INDEX "SensorStatus_sensorCode_parkingType_key" ON "SensorStatus"("sensorCode", "parkingType");
