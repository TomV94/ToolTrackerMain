-- Insert dummy users
INSERT INTO users (id, name, role) VALUES
('H001', 'John Smith', 'worker'),
('H002', 'Sarah Johnson', 'supervisor'),
('H003', 'Mike Brown', 'worker'),
('H004', 'Lisa Davis', 'admin'),
('H005', 'Tom Wilson', 'worker');

-- Insert dummy tools
INSERT INTO tools (id, description, status, location) VALUES
('T001', 'Hammer - 16oz', 'available', 'Tool Room A'),
('T002', 'Cordless Drill - DeWalt', 'available', 'Tool Room A'),
('T003', 'Circular Saw - Makita', 'available', 'Tool Room B'),
('T004', 'Measuring Tape - 25ft', 'available', 'Tool Room A'),
('T005', 'Safety Glasses', 'available', 'Tool Room C'),
('T006', 'Ladder - 6ft', 'available', 'Tool Room B'),
('T007', 'Wrench Set - Metric', 'available', 'Tool Room A'),
('T008', 'Level - 24in', 'available', 'Tool Room B'),
('T009', 'Screwdriver Set', 'available', 'Tool Room A'),
('T010', 'Hard Hat - Yellow', 'available', 'Tool Room C');

-- Insert some initial transactions
INSERT INTO transactions (tool_id, user_id, action, timestamp) VALUES
('T001', 'H001', 'check_out', NOW() - INTERVAL '2 days'),
('T001', 'H001', 'check_in', NOW() - INTERVAL '1 day'),
('T002', 'H002', 'check_out', NOW() - INTERVAL '3 days'),
('T003', 'H003', 'check_out', NOW() - INTERVAL '1 day'),
('T004', 'H001', 'check_out', NOW() - INTERVAL '4 hours');

-- Update some tools to checked out status
UPDATE tools SET status = 'checked_out' WHERE id IN ('T002', 'T003', 'T004'); 