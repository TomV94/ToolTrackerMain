-- 1. Insert tool types
INSERT INTO tool_types (name) VALUES
('Hand Tools'),
('Power Tools'),
('Measuring Tools'),
('Safety Equipment'),
('Ladders'),
('Electrical Tools'),
('Plumbing Tools'),
('Painting Tools'),
('Cleaning Equipment');

-- 2. Insert locations
INSERT INTO locations (name) VALUES
('Main Tool Room'),
('Site Office'),
('Warehouse A'),
('Warehouse B'),
('Mobile Tool Cart 1'),
('Mobile Tool Cart 2'),
('Safety Equipment Room'),
('Electrical Room'),
('Plumbing Room');

-- 3. Insert users
INSERT INTO users (barcode_id, name, phone, role) VALUES
('ADMIN001', 'Admin User', '555-0001', 'admin'),
('STORE001', 'Store Person', '555-0002', 'storeperson'),
('WORKER001', 'John Worker', '555-0003', 'worker');

-- 4. Insert tools
INSERT INTO tools (barcode_id, description, type_id, home_location_id) VALUES
('TOOL001', 'Hammer - 16oz', 1, 1),
('TOOL002', 'Cordless Drill - DeWalt', 2, 1),
('TOOL003', 'Tape Measure - 25ft', 3, 1),
('TOOL004', 'Safety Helmet', 4, 7),
('TOOL005', 'Extension Ladder - 24ft', 5, 2),
('TOOL006', 'Voltage Tester', 6, 8),
('TOOL007', 'Pipe Wrench - 14"', 7, 9),
('TOOL008', 'Paint Roller Set', 8, 1),
('TOOL009', 'Pressure Washer', 9, 3);

-- 5. Insert tool transactions
-- TOOL001 checked out by WORKER001 (recent)
INSERT INTO tool_transactions (tool_id, user_id, checkout_time, location_used_id)
VALUES (1, 3, NOW() - INTERVAL '2 hours', 2);
UPDATE tools SET status = 'checked_out', last_user_id = 3 WHERE tool_id = 1;

-- TOOL002 checked out by ADMIN001 (recent)
INSERT INTO tool_transactions (tool_id, user_id, checkout_time, location_used_id)
VALUES (2, 1, NOW() - INTERVAL '1 hour', 1);
UPDATE tools SET status = 'checked_out', last_user_id = 1 WHERE tool_id = 2;

-- TOOL003 checked out by STORE001 (overdue, 2 days ago)
INSERT INTO tool_transactions (tool_id, user_id, checkout_time, location_used_id)
VALUES (3, 2, NOW() - INTERVAL '2 days', 3);
UPDATE tools SET status = 'overdue', last_user_id = 2 WHERE tool_id = 3;

-- 6. Insert lost time log (for admin)
INSERT INTO lost_time_logs (user_id, reason, time_lost_minutes, tool_id, comment)
VALUES (1, 'tool_missing', 15, 3, 'Could not find Tape Measure');

-- 7. Insert reservation (admin reserves TOOL004 for tomorrow)
INSERT INTO reservations (user_id, tool_id, reserved_date)
VALUES (1, 4, CURRENT_DATE + INTERVAL '1 day');

-- 8. Insert audit log
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
VALUES (1, 'CREATE', 'TOOL', 1, '{"description": "Initial tool creation"}'); 