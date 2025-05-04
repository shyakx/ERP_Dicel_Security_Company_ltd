-- Insert sample security guards
INSERT INTO "SecurityGuard" (guardid, firstname, lastname, email, phone, rank, status)
VALUES
    ('SG001', 'John', 'Smith', 'john.smith@example.com', '1234567890', 'Senior Guard', 'Active'),
    ('SG002', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '2345678901', 'Supervisor', 'Active'),
    ('SG003', 'Michael', 'Brown', 'michael.brown@example.com', '3456789012', 'Junior Guard', 'Active'),
    ('SG004', 'Emily', 'Davis', 'emily.davis@example.com', '4567890123', 'Junior Guard', 'Active'),
    ('SG005', 'David', 'Wilson', 'david.wilson@example.com', '5678901234', 'Senior Guard', 'On Leave');

-- Insert sample guard shifts
INSERT INTO "GuardShift" (guardid, location, starttime, endtime, status)
VALUES
    (1, 'Main Entrance', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '6 hours', 'In Progress'),
    (2, 'Parking Lot', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '7 hours', 'In Progress'),
    (3, 'Building B', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day 8 hours', 'Scheduled'),
    (4, 'Main Entrance', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days 8 hours', 'Scheduled'),
    (5, 'Building A', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day 8 hours', 'Completed');

-- Insert sample security incidents
INSERT INTO "SecurityIncident" (date, type, location, description, status, reportedby)
VALUES
    (CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'Unauthorized Access', 'Parking Lot', 'Suspicious person attempting to enter restricted area', 'Under Investigation', 1),
    (CURRENT_TIMESTAMP - INTERVAL '2 hours', 'Equipment Failure', 'Building B', 'Security camera malfunction on 2nd floor', 'Pending', 2),
    (CURRENT_TIMESTAMP - INTERVAL '1 day', 'Security Breach', 'Main Entrance', 'Tailgating incident at main entrance', 'Resolved', 3),
    (CURRENT_TIMESTAMP - INTERVAL '2 days', 'Medical Emergency', 'Building A', 'Employee reported chest pain, ambulance called', 'Closed', 4),
    (CURRENT_TIMESTAMP - INTERVAL '3 days', 'Fire', 'Building C', 'Small fire in kitchen area, quickly contained', 'Closed', 2); 