-- Add floorPlanUrl column to rooms table

ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "floorPlanUrl" TEXT;

COMMIT;
