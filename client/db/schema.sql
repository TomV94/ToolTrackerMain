-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,          -- Barcode on hardhat
    name TEXT,
    role TEXT
);

-- TOOLS TABLE
CREATE TABLE IF NOT EXISTS tools (
    id TEXT PRIMARY KEY,          -- Tool barcode
    description TEXT,
    status TEXT CHECK (status IN ('available', 'checked_out')) DEFAULT 'available',
    location TEXT
);

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    tool_id TEXT REFERENCES tools(id),
    user_id TEXT REFERENCES users(id),
    action TEXT CHECK (action IN ('check_in', 'check_out')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
