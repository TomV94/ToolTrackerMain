# pgAdmin Setup Guide for Tool Tracker

## 1. Install pgAdmin 4
- Download and install pgAdmin 4 from: https://www.pgadmin.org/download/
- Launch pgAdmin 4

## 2. Create Server Connection
1. Right-click on "Servers" in the left sidebar
2. Select "Create" > "Server"
3. In the "General" tab:
   - Name: Tool Tracker
4. In the "Connection" tab:
   - Host: localhost
   - Port: 5432
   - Maintenance database: postgres
   - Username: postgres
   - Password: postgres
5. Click "Save"

## 3. Create Database
1. Right-click on "Databases" under your server
2. Select "Create" > "Database"
3. Enter the following:
   - Database: tool_tracker
   - Owner: postgres
4. Click "Save"

## 4. Import Schema
1. Right-click on the "tool_tracker" database
2. Select "Query Tool"
3. Copy and paste the contents of `schema.sql`
4. Click "Execute" (F5)

## 5. Initialize Database
1. Open a new Query Tool
2. Run the following commands to create initial data:

```sql
-- Insert tool types
INSERT INTO tool_types (name) VALUES
  ('Hand Tool'),
  ('Power Tool'),
  ('Measuring Tool'),
  ('Safety Equipment'),
  ('Specialty Tool')
ON CONFLICT (name) DO NOTHING;

-- Insert locations
INSERT INTO locations (name) VALUES
  ('Commissioning Store'),
  ('Mech Container'),
  ('Site Office'),
  ('Tool Room'),
  ('Field Storage')
ON CONFLICT (name) DO NOTHING;

-- Create admin user
INSERT INTO users (barcode_id, name, role, phone)
VALUES ('ADMIN001', 'System Administrator', 'admin', '0000000000')
ON CONFLICT (barcode_id) DO NOTHING;
```

## 6. Verify Setup
1. Expand the "tool_tracker" database
2. Verify the following tables exist:
   - tool_types
   - locations
   - users
   - tools
   - tool_transactions
   - lost_time_logs
   - reservations
   - audit_logs

## 7. Create Backup
1. Right-click on "tool_tracker" database
2. Select "Backup"
3. Choose a location to save the backup
4. Click "Backup"

## 8. Security Recommendations
1. Change the default postgres password
2. Update the database connection settings in `config/database.js`
3. Set up SSL if deploying to production
4. Create a read-only user for reports

## 9. Monitoring Setup
1. Right-click on "tool_tracker" database
2. Select "Properties"
3. Go to "Statistics" tab
4. Enable "Track I/O timing"
5. Enable "Track function calls"

## 10. Maintenance
1. Set up regular backups
2. Monitor database size
3. Check for long-running queries
4. Review and optimize indexes
5. Monitor connection pool usage 