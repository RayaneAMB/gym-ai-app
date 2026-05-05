-- CreateTable
CREATE TABLE "user_profile" (
    "user_id" UUID NOT NULL,
    "goal" VARCHAR(20) NOT NULL,
    "experience" VARCHAR(20) NOT NULL,
    "days_per_week" INTEGER NOT NULL,
    "session_length" INTEGER NOT NULL,
    "equipment" VARCHAR(20) NOT NULL,
    "injuries" TEXT,
    "split_preference" VARCHAR(20) NOT NULL,
    "Updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("user_id")
);
