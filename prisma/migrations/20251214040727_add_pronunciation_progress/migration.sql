-- CreateTable
CREATE TABLE "pronunciation_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "letter_id" TEXT NOT NULL,
    "is_learned" BOOLEAN NOT NULL DEFAULT false,
    "times_practiced" INTEGER NOT NULL DEFAULT 0,
    "accuracy_score" DECIMAL(5,2),
    "last_practiced_at" TIMESTAMP(3),
    "mastered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pronunciation_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pronunciation_progress_user_id_is_learned_idx" ON "pronunciation_progress"("user_id", "is_learned");

-- CreateIndex
CREATE INDEX "pronunciation_progress_letter_id_idx" ON "pronunciation_progress"("letter_id");

-- CreateIndex
CREATE UNIQUE INDEX "pronunciation_progress_user_id_letter_id_key" ON "pronunciation_progress"("user_id", "letter_id");

-- AddForeignKey
ALTER TABLE "pronunciation_progress" ADD CONSTRAINT "pronunciation_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
