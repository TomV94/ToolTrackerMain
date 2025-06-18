# Tool Tracker - Complete Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

## Step 1: PostgreSQL Setup

### Install PostgreSQL (if not already installed)

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Add PostgreSQL to your PATH (usually `C:\Program Files\PostgreSQL\[version]\bin`)

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database

1. **Open PostgreSQL command line:**
   ```bash
   psql -U postgres
   ```

2. **Create the database:**
   ```sql
   CREATE DATABASE tool_tracker;
   \q
   ```

3. **Run the schema:**
   ```bash
   psql -U postgres -d tool_tracker -f server/db/schema.sql
   ```

4. **Run the seed data:**
   ```bash
   psql -U postgres -d tool_tracker -f server/db/seed.sql
   ```

## Step 2: Environment Configuration

### Create .env file in server directory

Create `tool-tracker-app/server/.env` with the following content:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=tool_tracker
DB_PASSWORD=your_postgres_password_here
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

**Important:** Replace `your_postgres_password_here` with the password you set during PostgreSQL installation.

## Step 3: Install Dependencies

### Backend Dependencies
```bash
cd tool-tracker-app/server
npm install
```

### Frontend Dependencies
```bash
cd tool-tracker-app/client
npm install
```

## Step 4: Start the Application

### Start the Backend Server
```bash
cd tool-tracker-app/server
npm start
```

The backend will run on: http://localhost:5000

### Start the Frontend Client (in a new terminal)
```bash
cd tool-tracker-app/client
npm run dev
```

The frontend will run on: http://localhost:5173

## Step 5: Verify Installation

### Test Database Connection
```bash
cd tool-tracker-app/server
node test-db.js
```

You should see: "Successfully connected to the database"

### Access the Application
1. Open your browser to: http://localhost:5173
2. You should see the Tool Tracker application
3. Use the default test credentials:
   - **Admin:** Barcode: `ADMIN001`
   - **Storeperson:** Barcode: `STORE001`
   - **Worker:** Barcode: `WORKER001`

## Troubleshooting

### Database Connection Issues
1. **Check if PostgreSQL is running:**
   ```bash
   # Windows
   services.msc  # Look for "postgresql-x64-[version]"
   
   # macOS
   brew services list | grep postgresql
   
   # Linux
   sudo systemctl status postgresql
   ```

2. **Verify database exists:**
   ```bash
   psql -U postgres -l
   ```

3. **Check .env file:** Ensure the password in your .env file matches your PostgreSQL password

### Port Issues
- If port 5000 is in use, change `PORT=5000` to `PORT=5001` in .env
- If port 5173 is in use, Vite will automatically use the next available port

### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Default Data

The application comes with sample data:

### Users
- **Admin User** (Barcode: `ADMIN001`)
- **Store Person** (Barcode: `STORE001`)
- **John Worker** (Barcode: `WORKER001`)

### Tools
- Hammer, Cordless Drill, Tape Measure, Safety Helmet, etc.

### Locations
- Main Tool Room, Site Office, Warehouse A, etc.

## Next Steps

1. **Customize the application** for your specific needs
2. **Add real users and tools** through the admin interface
3. **Configure barcode scanners** for production use
4. **Set up proper JWT secrets** for production deployment

## Support

If you encounter issues:
1. Check the console logs in both terminal windows
2. Verify all prerequisites are installed
3. Ensure database connection is working
4. Check that all environment variables are set correctly 