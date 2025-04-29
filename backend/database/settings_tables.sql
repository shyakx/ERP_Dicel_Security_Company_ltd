-- Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    logo_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT company_settings_single_row CHECK (id = 1)
);

-- System Preferences Table
CREATE TABLE IF NOT EXISTS system_preferences (
    id INTEGER PRIMARY KEY DEFAULT 1,
    default_currency VARCHAR(10) DEFAULT 'RWF',
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_zone VARCHAR(50) DEFAULT 'Africa/Kigali',
    enable_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_preferences_single_row CHECK (id = 1)
);

-- Email Settings Table
CREATE TABLE IF NOT EXISTS email_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    smtp_server VARCHAR(255),
    smtp_port INTEGER,
    smtp_security VARCHAR(10),
    smtp_username VARCHAR(255),
    smtp_password VARCHAR(255),
    from_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_settings_single_row CHECK (id = 1)
);

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_company_settings_timestamp
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_system_preferences_timestamp
    BEFORE UPDATE ON system_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_email_settings_timestamp
    BEFORE UPDATE ON email_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Insert default values
INSERT INTO company_settings (id, company_name)
VALUES (1, 'DICEL Security Company Ltd.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_preferences (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING; 