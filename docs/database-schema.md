# **Salah Companion - Database Schema**

## **Overview**

The database schema is designed to support all core features of Salah Companion while maintaining data integrity, performance, and security. The schema follows normalization principles while optimizing for common query patterns.

## **Technology Stack**

- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Caching**: Redis (for session management and prayer time caching)

## **Schema Design Principles**

1. **Normalization**: Third normal form (3NF) to reduce redundancy
2. **Performance**: Strategic indexing for common queries
3. **Security**: Encryption at rest, sensitive data protection
4. **Scalability**: Designed to handle millions of users
5. **Offline Support**: Local-first architecture with sync capabilities

## **Entity Relationship Diagram**

```
Users ──┬──> UserProgress
        ├──> PrayerRecords
        ├──> RecitationPractice
        ├──> Achievements
        ├──> UserSettings
        └──> Subscriptions

PrayerTimes ──> PrayerNotifications
Surahs ──> Ayahs ──> RecitationPractice
Holidays ──> HolidayEducation
Achievements ──> UserAchievements
```

## **Core Tables**

### **1. Users**

Stores user account information and authentication data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, premium
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  learning_level INTEGER DEFAULT 1, -- 1-5 (Seeker to Steadfast)
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  prayer_calculation_method VARCHAR(50) DEFAULT 'MWL',
  asr_calculation_method VARCHAR(20) DEFAULT 'Shafi', -- Shafi, Hanafi
  high_latitude_method VARCHAR(50),
  fajr_angle DECIMAL(5, 2),
  isha_angle DECIMAL(5, 2),
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  recovery_codes TEXT[],
  privacy_settings JSONB DEFAULT '{}',
  accessibility_settings JSONB DEFAULT '{}',
  CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'premium'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_expires_at);
CREATE INDEX idx_users_location ON users(location_latitude, location_longitude);
```

### **2. UserSettings**

User preferences and app configuration.

```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  azan_voice VARCHAR(50) DEFAULT 'makkah',
  azan_volume INTEGER DEFAULT 80 CHECK (azan_volume >= 0 AND azan_volume <= 100),
  azan_fade_in BOOLEAN DEFAULT true,
  azan_dnd_override BOOLEAN DEFAULT false,
  azan_vibration BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  notification_sound BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT false,
  font_size VARCHAR(20) DEFAULT 'medium',
  dyslexia_font BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  audio_speed DECIMAL(3, 2) DEFAULT 1.0,
  recitation_feedback_enabled BOOLEAN DEFAULT true,
  gamification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

### **3. PrayerTimes**

Cached prayer times for locations (calculated daily).

```sql
CREATE TABLE prayer_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  calculation_method VARCHAR(50) NOT NULL,
  fajr_time TIME NOT NULL,
  sunrise_time TIME NOT NULL,
  dhuhr_time TIME NOT NULL,
  asr_time TIME NOT NULL,
  maghrib_time TIME NOT NULL,
  isha_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, latitude, longitude, calculation_method)
);

CREATE INDEX idx_prayer_times_location ON prayer_times(latitude, longitude, date);
CREATE INDEX idx_prayer_times_date ON prayer_times(date);
```

### **4. PrayerRecords**

Tracks user's prayer completion.

```sql
CREATE TABLE prayer_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prayer_name VARCHAR(20) NOT NULL, -- fajr, dhuhr, asr, maghrib, isha
  prayer_date DATE NOT NULL,
  prayer_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  was_guided BOOLEAN DEFAULT true,
  was_on_time BOOLEAN,
  rak_ahs_completed INTEGER DEFAULT 0,
  sunnah_before BOOLEAN DEFAULT false,
  sunnah_after BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_prayer_name CHECK (prayer_name IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah', 'eid', 'tarawih', 'witr'))
);

CREATE INDEX idx_prayer_records_user_date ON prayer_records(user_id, prayer_date);
CREATE INDEX idx_prayer_records_user_prayer ON prayer_records(user_id, prayer_name);
CREATE INDEX idx_prayer_records_date ON prayer_records(prayer_date);
```

### **5. PrayerNotifications**

Tracks Azan notifications sent to users.

```sql
CREATE TABLE prayer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prayer_name VARCHAR(20) NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  notification_type VARCHAR(20) DEFAULT 'azan', -- azan, reminder, iqamah
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, opened, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prayer_notifications_user ON prayer_notifications(user_id, scheduled_time);
CREATE INDEX idx_prayer_notifications_status ON prayer_notifications(status, scheduled_time);
```

### **6. Surahs**

Quranic chapters/surahs library.

```sql
CREATE TABLE surahs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_number INTEGER UNIQUE NOT NULL,
  arabic_name VARCHAR(100) NOT NULL,
  transliterated_name VARCHAR(100) NOT NULL,
  english_name VARCHAR(100) NOT NULL,
  number_of_ayahs INTEGER NOT NULL,
  revelation_type VARCHAR(20) NOT NULL, -- meccan, medinan
  juz_number INTEGER,
  is_short_surah BOOLEAN DEFAULT false,
  is_in_juz_amma BOOLEAN DEFAULT false,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_surahs_number ON surahs(surah_number);
CREATE INDEX idx_surahs_juz ON surahs(juz_number);
```

### **7. Ayahs**

Individual verses from the Quran.

```sql
CREATE TABLE ayahs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah_id UUID NOT NULL REFERENCES surahs(id) ON DELETE CASCADE,
  ayah_number INTEGER NOT NULL,
  arabic_text TEXT NOT NULL,
  transliteration TEXT,
  english_translation TEXT,
  word_by_word_breakdown JSONB,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(surah_id, ayah_number)
);

CREATE INDEX idx_ayahs_surah ON ayahs(surah_id, ayah_number);
CREATE INDEX idx_ayahs_text_search ON ayahs USING gin(to_tsvector('english', arabic_text || ' ' || english_translation));
```

### **8. RecitationPractice**

User's recitation practice sessions and feedback.

```sql
CREATE TABLE recitation_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  surah_id UUID REFERENCES surahs(id) ON DELETE SET NULL,
  ayah_id UUID REFERENCES ayahs(id) ON DELETE SET NULL,
  practice_mode VARCHAR(20) NOT NULL, -- word, ayah, surah
  audio_recording_url TEXT, -- Local storage reference (never on server)
  accuracy_score DECIMAL(5, 2), -- 0-100
  tajweed_score DECIMAL(5, 2), -- 0-100
  feedback_data JSONB, -- Detailed feedback from AI
  phoneme_analysis JSONB, -- Specific sound corrections
  practice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  attempts_count INTEGER DEFAULT 1,
  is_offline BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recitation_practice_user ON recitation_practice(user_id, practice_date);
CREATE INDEX idx_recitation_practice_surah ON recitation_practice(surah_id);
```

### **9. UserProgress**

Tracks user's learning progress and streaks.

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL,
  prayers_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  surahs_memorized INTEGER DEFAULT 0,
  practice_sessions INTEGER DEFAULT 0,
  total_practice_minutes INTEGER DEFAULT 0,
  pronunciation_improvement DECIMAL(5, 2) DEFAULT 0,
  achievements_unlocked INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, progress_date)
);

CREATE INDEX idx_user_progress_user_date ON user_progress(user_id, progress_date);
CREATE INDEX idx_user_progress_streak ON user_progress(user_id, current_streak);
```

### **10. Achievements**

Achievement definitions.

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- prayer, learning, recitation, consistency
  icon_name VARCHAR(50),
  points_awarded INTEGER DEFAULT 0,
  requirement_type VARCHAR(50) NOT NULL, -- streak, count, accuracy, etc.
  requirement_value INTEGER,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_key ON achievements(achievement_key);
```

### **11. UserAchievements**

User's unlocked achievements.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_data JSONB, -- Track progress toward achievement
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, unlocked_at);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
```

### **12. Holidays**

Islamic holidays and significant dates.

```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_key VARCHAR(100) UNIQUE NOT NULL,
  arabic_name VARCHAR(100) NOT NULL,
  english_name VARCHAR(100) NOT NULL,
  hijri_month INTEGER NOT NULL,
  hijri_day INTEGER,
  is_movable BOOLEAN DEFAULT false, -- Ramadan, Eid (based on moon sighting)
  significance TEXT NOT NULL,
  recommended_practices TEXT,
  prohibited_actions TEXT,
  education_content TEXT,
  audio_guide_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_holidays_month_day ON holidays(hijri_month, hijri_day);
CREATE INDEX idx_holidays_key ON holidays(holiday_key);
```

### **13. HolidayObservances**

Actual holiday dates (for movable holidays).

```sql
CREATE TABLE holiday_observances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_id UUID NOT NULL REFERENCES holidays(id) ON DELETE CASCADE,
  hijri_date DATE NOT NULL,
  gregorian_date DATE NOT NULL,
  is_confirmed BOOLEAN DEFAULT false,
  region VARCHAR(100), -- For regional differences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(holiday_id, hijri_date, region)
);

CREATE INDEX idx_holiday_observances_date ON holiday_observances(gregorian_date);
CREATE INDEX idx_holiday_observances_holiday ON holiday_observances(holiday_id);
```

### **14. Subscriptions**

Premium subscription management.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(20) NOT NULL, -- monthly, yearly, family
  status VARCHAR(20) NOT NULL, -- active, cancelled, expired, trial
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  payment_provider VARCHAR(50), -- stripe, apple, google
  payment_provider_id VARCHAR(255),
  amount_paid DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  family_member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_expires ON subscriptions(expires_at, status);
```

### **15. FamilyMembers**

Family sharing for premium subscriptions.

```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, removed
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(subscription_id, user_id)
);

CREATE INDEX idx_family_members_subscription ON family_members(subscription_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
```

## **Performance Optimizations**

### **Indexes**
- Strategic indexes on foreign keys and frequently queried columns
- Composite indexes for common query patterns
- Full-text search indexes for Arabic and English text

### **Caching Strategy**
- Prayer times cached in Redis (24-hour TTL)
- User settings cached in Redis (1-hour TTL)
- Achievement definitions cached in Redis (24-hour TTL)

### **Partitioning**
- `prayer_records` partitioned by date (monthly partitions)
- `recitation_practice` partitioned by date (monthly partitions)
- `user_progress` partitioned by date (monthly partitions)

## **Security Considerations**

1. **Encryption**: Sensitive fields encrypted at rest
2. **Password Hashing**: bcrypt with 12 rounds
3. **PII Protection**: Minimal data collection, GDPR compliant
4. **Audio Privacy**: Voice recordings never stored on servers
5. **Access Control**: Row-level security for user data

## **Migration Strategy**

- Version-controlled migrations using Prisma
- Rollback procedures for each migration
- Data migration scripts for schema changes
- Backup before major migrations

## **Data Dictionary**

See [data-dictionary.md](data-dictionary.md) for detailed field descriptions and relationships.

---

*This schema is version-controlled and will evolve with the application.*

