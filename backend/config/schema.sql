-- Create Payroll table
CREATE TABLE IF NOT EXISTS "Payroll" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employeeid UUID REFERENCES "Employee"(id) ON DELETE CASCADE,
    base_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Pending', 'Paid', 'Failed')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 