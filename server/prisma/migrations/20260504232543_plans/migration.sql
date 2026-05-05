-- CreateTable
CREATE TABLE "trainings_plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan_json" JSONB NOT NULL,
    "plan_text" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "trainings_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_trainings_plan_user_id" ON "trainings_plan"("user_id");
