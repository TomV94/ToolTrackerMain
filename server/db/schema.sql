-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS lost_time_logs CASCADE;
DROP TABLE IF EXISTS tool_transactions CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS tool_types CASCADE;

-- Create tool_types table first (no dependencies)
CREATE TABLE tool_types (
  type_id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create locations table (no dependencies)
CREATE TABLE locations (
  location_id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (no dependencies)
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  barcode_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'storeperson', 'worker')),
  active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tools table (depends on tool_types, locations, users)
CREATE TABLE tools (
  tool_id SERIAL PRIMARY KEY,
  barcode_id VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(200) NOT NULL,
  type_id INTEGER REFERENCES tool_types(type_id) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'overdue', 'reserved')),
  last_user_id INTEGER REFERENCES users(user_id),
  home_location_id INTEGER REFERENCES locations(location_id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tool_transactions table (depends on tools, users, locations)
CREATE TABLE tool_transactions (
  transaction_id SERIAL PRIMARY KEY,
  tool_id INTEGER REFERENCES tools(tool_id) NOT NULL,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  checkout_time TIMESTAMP NOT NULL,
  checkin_time TIMESTAMP,
  location_used_id INTEGER REFERENCES locations(location_id) NOT NULL,
  return_photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lost_time_logs table (depends on users, tools)
CREATE TABLE lost_time_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  reason VARCHAR(100) NOT NULL,
  time_lost_minutes INTEGER NOT NULL,
  tool_id INTEGER REFERENCES tools(tool_id),
  comment TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table (depends on users, tools)
CREATE TABLE reservations (
  reservation_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  tool_id INTEGER REFERENCES tools(tool_id) NOT NULL,
  reserved_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tool_id, reserved_date)
);

-- Create audit_logs table (depends on users)
CREATE TABLE audit_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_type ON tools(type_id);
CREATE INDEX idx_tools_location ON tools(home_location_id);
CREATE INDEX idx_tool_transactions_tool_id ON tool_transactions(tool_id);
CREATE INDEX idx_tool_transactions_user_id ON tool_transactions(user_id);
CREATE INDEX idx_tool_transactions_location ON tool_transactions(location_used_id);
CREATE INDEX idx_reservations_tool_date ON reservations(tool_id, reserved_date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tool_types_updated_at
  BEFORE UPDATE ON tool_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_transactions_updated_at
  BEFORE UPDATE ON tool_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 