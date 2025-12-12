# **Testing and Database Setup Guide**

## **Step 1: Testing the App**

### **Start Metro Bundler**
```bash
npm run dev
```

### **Run on iOS Simulator**
```bash
npm run ios
# Or specify simulator:
npm run ios -- --simulator="iPhone 15"
```

### **Run on Android**
```bash
npm run android
```

### **Expected Behavior**

Once the app launches, you should see:

1. **Home Screen**
   - "As-salamu alaykum" greeting
   - Next prayer time (calculated)
   - Quick action buttons

2. **Prayer Times Screen**
   - Location permission request
   - All 5 prayer times displayed
   - Next prayer indicator

3. **Guided Salah Screen**
   - Step-by-step prayer guidance
   - Progress indicator
   - Navigation controls

## **Step 2: Database Setup**

### **Prerequisites**
- PostgreSQL installed (check with `psql --version`)
- Database server running

### **1. Create Database**

```bash
createdb salah_companion
```

Or using psql:
```bash
psql postgres
CREATE DATABASE salah_companion;
\q
```

### **2. Configure Environment Variables**

Create `.env` file in project root:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/salah_companion"
DIRECT_URL="postgresql://your_username:your_password@localhost:5432/salah_companion"
```

**Replace:**
- `your_username` with your PostgreSQL username
- `your_password` with your PostgreSQL password
- `localhost:5432` if using different host/port

### **3. Run Migrations**

```bash
npm run db:migrate
```

This will:
- Create all database tables
- Set up relationships
- Apply schema changes

### **4. Seed Database**

```bash
npm run db:seed
```

This will populate:
- Islamic holidays
- Achievements
- Initial surah data
- Sample content

### **5. Verify Setup**

```bash
# Open Prisma Studio to view data
npm run db:studio
```

Or check via psql:
```bash
psql salah_companion
\dt  # List tables
SELECT COUNT(*) FROM "User";  # Check data
\q
```

## **Troubleshooting**

### **App Won't Build**

1. **Clean build:**
   ```bash
   cd ios
   xcodebuild clean
   cd ..
   ```

2. **Reinstall pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Clear Metro cache:**
   ```bash
   npm start -- --reset-cache
   ```

### **Database Connection Issues**

1. **Check PostgreSQL is running:**
   ```bash
   brew services list | grep postgresql
   # Or
   pg_isready
   ```

2. **Verify credentials in .env**

3. **Test connection:**
   ```bash
   psql -d salah_companion -U your_username
   ```

### **Migration Errors**

1. **Reset database (development only):**
   ```bash
   npm run db:migrate:reset
   ```

2. **Check Prisma client:**
   ```bash
   npm run db:generate
   ```

## **Next Steps After Setup**

1. ✅ App tested and running
2. ✅ Database configured
3. ✅ Migrations applied
4. ✅ Data seeded

**Ready for development!** 🚀

