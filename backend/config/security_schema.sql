-- Security Guard table
CREATE TABLE IF NOT EXISTS "SecurityGuard" (
    id SERIAL PRIMARY KEY,
    guardid VARCHAR(50) UNIQUE NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    rank VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guard Shift table
CREATE TABLE IF NOT EXISTS "GuardShift" (
    id SERIAL PRIMARY KEY,
    guardid INTEGER REFERENCES "SecurityGuard"(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    starttime TIMESTAMP NOT NULL,
    endtime TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Incident table
CREATE TABLE IF NOT EXISTS "SecurityIncident" (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    reportedby INTEGER REFERENCES "SecurityGuard"(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_security_guard_updated_at ON "SecurityGuard";
DROP TRIGGER IF EXISTS update_guard_shift_updated_at ON "GuardShift";
DROP TRIGGER IF EXISTS update_security_incident_updated_at ON "SecurityIncident";

-- Create triggers for all tables
CREATE TRIGGER update_security_guard_updated_at
    BEFORE UPDATE ON "SecurityGuard"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guard_shift_updated_at
    BEFORE UPDATE ON "GuardShift"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incident_updated_at
    BEFORE UPDATE ON "SecurityIncident"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();