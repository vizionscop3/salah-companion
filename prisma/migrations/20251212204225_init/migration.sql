-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscription_tier" TEXT NOT NULL DEFAULT 'free',
    "subscription_expires_at" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "learning_level" INTEGER NOT NULL DEFAULT 1,
    "preferred_language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "location_latitude" DECIMAL(10,8),
    "location_longitude" DECIMAL(11,8),
    "location_city" TEXT,
    "location_country" TEXT,
    "prayer_calculation_method" TEXT NOT NULL DEFAULT 'MWL',
    "asr_calculation_method" TEXT NOT NULL DEFAULT 'Shafi',
    "high_latitude_method" TEXT,
    "fajr_angle" DECIMAL(5,2),
    "isha_angle" DECIMAL(5,2),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "recovery_codes" TEXT[],
    "privacy_settings" JSONB NOT NULL DEFAULT '{}',
    "accessibility_settings" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "azan_voice" TEXT NOT NULL DEFAULT 'makkah',
    "azan_volume" INTEGER NOT NULL DEFAULT 80,
    "azan_fade_in" BOOLEAN NOT NULL DEFAULT true,
    "azan_dnd_override" BOOLEAN NOT NULL DEFAULT false,
    "azan_vibration" BOOLEAN NOT NULL DEFAULT true,
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "notification_sound" BOOLEAN NOT NULL DEFAULT true,
    "dark_mode" BOOLEAN NOT NULL DEFAULT false,
    "font_size" TEXT NOT NULL DEFAULT 'medium',
    "dyslexia_font" BOOLEAN NOT NULL DEFAULT false,
    "high_contrast" BOOLEAN NOT NULL DEFAULT false,
    "audio_speed" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "recitation_feedback_enabled" BOOLEAN NOT NULL DEFAULT true,
    "gamification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_times" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "calculation_method" TEXT NOT NULL,
    "fajr_time" TIME NOT NULL,
    "sunrise_time" TIME NOT NULL,
    "dhuhr_time" TIME NOT NULL,
    "asr_time" TIME NOT NULL,
    "maghrib_time" TIME NOT NULL,
    "isha_time" TIME NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prayer_name" TEXT NOT NULL,
    "prayer_date" DATE NOT NULL,
    "prayer_time" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "was_guided" BOOLEAN NOT NULL DEFAULT true,
    "was_on_time" BOOLEAN,
    "rak_ahs_completed" INTEGER NOT NULL DEFAULT 0,
    "sunnah_before" BOOLEAN NOT NULL DEFAULT false,
    "sunnah_after" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prayer_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prayer_name" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "notification_type" TEXT NOT NULL DEFAULT 'azan',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prayer_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surahs" (
    "id" TEXT NOT NULL,
    "surah_number" INTEGER NOT NULL,
    "arabic_name" TEXT NOT NULL,
    "transliterated_name" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "number_of_ayahs" INTEGER NOT NULL,
    "revelation_type" TEXT NOT NULL,
    "juz_number" INTEGER,
    "is_short_surah" BOOLEAN NOT NULL DEFAULT false,
    "is_in_juz_amma" BOOLEAN NOT NULL DEFAULT false,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surahs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ayahs" (
    "id" TEXT NOT NULL,
    "surah_id" TEXT NOT NULL,
    "ayah_number" INTEGER NOT NULL,
    "arabic_text" TEXT NOT NULL,
    "transliteration" TEXT,
    "english_translation" TEXT,
    "word_by_word_breakdown" JSONB,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ayahs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recitation_practice" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "surah_id" TEXT,
    "ayah_id" TEXT,
    "practice_mode" TEXT NOT NULL,
    "audio_recording_url" TEXT,
    "accuracy_score" DECIMAL(5,2),
    "tajweed_score" DECIMAL(5,2),
    "feedback_data" JSONB,
    "phoneme_analysis" JSONB,
    "practice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_seconds" INTEGER,
    "attempts_count" INTEGER NOT NULL DEFAULT 1,
    "is_offline" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recitation_practice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "progress_date" DATE NOT NULL,
    "prayers_completed" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "surahs_memorized" INTEGER NOT NULL DEFAULT 0,
    "practice_sessions" INTEGER NOT NULL DEFAULT 0,
    "total_practice_minutes" INTEGER NOT NULL DEFAULT 0,
    "pronunciation_improvement" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "achievements_unlocked" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "achievement_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon_name" TEXT,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "requirement_type" TEXT NOT NULL,
    "requirementValue" INTEGER,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress_data" JSONB,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "holiday_key" TEXT NOT NULL,
    "arabic_name" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "hijri_month" INTEGER NOT NULL,
    "hijri_day" INTEGER,
    "is_movable" BOOLEAN NOT NULL DEFAULT false,
    "significance" TEXT NOT NULL,
    "recommended_practices" TEXT,
    "prohibited_actions" TEXT,
    "education_content" TEXT,
    "audio_guide_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_observances" (
    "id" TEXT NOT NULL,
    "holiday_id" TEXT NOT NULL,
    "hijri_date" DATE NOT NULL,
    "gregorian_date" DATE NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_observances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "payment_provider" TEXT,
    "payment_provider_id" TEXT,
    "amount_paid" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "family_member_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_subscription_tier_subscription_expires_at_idx" ON "users"("subscription_tier", "subscription_expires_at");

-- CreateIndex
CREATE INDEX "users_location_latitude_location_longitude_idx" ON "users"("location_latitude", "location_longitude");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "user_settings_user_id_idx" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "prayer_times_latitude_longitude_date_idx" ON "prayer_times"("latitude", "longitude", "date");

-- CreateIndex
CREATE INDEX "prayer_times_date_idx" ON "prayer_times"("date");

-- CreateIndex
CREATE UNIQUE INDEX "prayer_times_date_latitude_longitude_calculation_method_key" ON "prayer_times"("date", "latitude", "longitude", "calculation_method");

-- CreateIndex
CREATE INDEX "prayer_records_user_id_prayer_date_idx" ON "prayer_records"("user_id", "prayer_date");

-- CreateIndex
CREATE INDEX "prayer_records_user_id_prayer_name_idx" ON "prayer_records"("user_id", "prayer_name");

-- CreateIndex
CREATE INDEX "prayer_records_prayer_date_idx" ON "prayer_records"("prayer_date");

-- CreateIndex
CREATE INDEX "prayer_notifications_user_id_scheduled_time_idx" ON "prayer_notifications"("user_id", "scheduled_time");

-- CreateIndex
CREATE INDEX "prayer_notifications_status_scheduled_time_idx" ON "prayer_notifications"("status", "scheduled_time");

-- CreateIndex
CREATE UNIQUE INDEX "surahs_surah_number_key" ON "surahs"("surah_number");

-- CreateIndex
CREATE INDEX "surahs_surah_number_idx" ON "surahs"("surah_number");

-- CreateIndex
CREATE INDEX "surahs_juz_number_idx" ON "surahs"("juz_number");

-- CreateIndex
CREATE INDEX "ayahs_surah_id_ayah_number_idx" ON "ayahs"("surah_id", "ayah_number");

-- CreateIndex
CREATE UNIQUE INDEX "ayahs_surah_id_ayah_number_key" ON "ayahs"("surah_id", "ayah_number");

-- CreateIndex
CREATE INDEX "recitation_practice_user_id_practice_date_idx" ON "recitation_practice"("user_id", "practice_date");

-- CreateIndex
CREATE INDEX "recitation_practice_surah_id_idx" ON "recitation_practice"("surah_id");

-- CreateIndex
CREATE INDEX "user_progress_user_id_progress_date_idx" ON "user_progress"("user_id", "progress_date");

-- CreateIndex
CREATE INDEX "user_progress_user_id_current_streak_idx" ON "user_progress"("user_id", "current_streak");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_progress_date_key" ON "user_progress"("user_id", "progress_date");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_achievement_key_key" ON "achievements"("achievement_key");

-- CreateIndex
CREATE INDEX "achievements_category_idx" ON "achievements"("category");

-- CreateIndex
CREATE INDEX "achievements_achievement_key_idx" ON "achievements"("achievement_key");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_unlocked_at_idx" ON "user_achievements"("user_id", "unlocked_at");

-- CreateIndex
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements"("achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_holiday_key_key" ON "holidays"("holiday_key");

-- CreateIndex
CREATE INDEX "holidays_hijri_month_hijri_day_idx" ON "holidays"("hijri_month", "hijri_day");

-- CreateIndex
CREATE INDEX "holidays_holiday_key_idx" ON "holidays"("holiday_key");

-- CreateIndex
CREATE INDEX "holiday_observances_gregorian_date_idx" ON "holiday_observances"("gregorian_date");

-- CreateIndex
CREATE INDEX "holiday_observances_holiday_id_idx" ON "holiday_observances"("holiday_id");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_observances_holiday_id_hijri_date_region_key" ON "holiday_observances"("holiday_id", "hijri_date", "region");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");

-- CreateIndex
CREATE INDEX "subscriptions_expires_at_status_idx" ON "subscriptions"("expires_at", "status");

-- CreateIndex
CREATE INDEX "family_members_subscription_id_idx" ON "family_members"("subscription_id");

-- CreateIndex
CREATE INDEX "family_members_user_id_idx" ON "family_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_subscription_id_user_id_key" ON "family_members"("subscription_id", "user_id");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_records" ADD CONSTRAINT "prayer_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prayer_notifications" ADD CONSTRAINT "prayer_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ayahs" ADD CONSTRAINT "ayahs_surah_id_fkey" FOREIGN KEY ("surah_id") REFERENCES "surahs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recitation_practice" ADD CONSTRAINT "recitation_practice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_observances" ADD CONSTRAINT "holiday_observances_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "holidays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
