-- ThermoTwin Web Supabase PostgreSQL Database Schema
-- Production Relational Schema with Row Level Security (RLS)

-- 1. Enum Types
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER');
CREATE TYPE session_status AS ENUM ('CREATED', 'STARTED', 'IN_PROGRESS', 'STEADY_STATE', 'SUBMITTED', 'REVIEWED', 'ABANDONED');
CREATE TYPE review_status AS ENUM ('PENDING', 'REVIEWED');

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    institution VARCHAR(255) NOT NULL,
    student_id_number VARCHAR(100),
    teacher_id_number VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Classes Table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Class Members Enrollment Table
CREATE TABLE class_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 5. Experiment Assignments Table
CREATE TABLE experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    experiment_type VARCHAR(100) NOT NULL DEFAULT 'thermal_conductivity',
    instructions TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_attempts INT DEFAULT 3,
    required_material VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Experiment Sessions Table
CREATE TABLE experiment_sessions (
    id VARCHAR(100) PRIMARY KEY, -- e.g. EXP-2026-001245
    assignment_id UUID NOT NULL REFERENCES experiment_assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status session_status NOT NULL DEFAULT 'STARTED',
    material_id VARCHAR(50) NOT NULL DEFAULT 'copper',
    voltage NUMERIC(5,2) DEFAULT 0,
    current NUMERIC(5,2) DEFAULT 0,
    power NUMERIC(5,2) DEFAULT 0,
    water_flow_lmin NUMERIC(5,2) DEFAULT 0,
    steady_state_status VARCHAR(50) DEFAULT 'TRANSIENT',
    calculated_k NUMERIC(8,2)
);

-- 7. Observations Log Table
CREATE TABLE experiment_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL REFERENCES experiment_sessions(id) ON DELETE CASCADE,
    sample_time_seconds INT NOT NULL,
    voltage NUMERIC(5,2) NOT NULL,
    current NUMERIC(5,2) NOT NULL,
    power NUMERIC(5,2) NOT NULL,
    flow_rate NUMERIC(5,2) NOT NULL,
    t1 NUMERIC(5,2) NOT NULL,
    t2 NUMERIC(5,2) NOT NULL,
    t3 NUMERIC(5,2) NOT NULL,
    t4 NUMERIC(5,2) NOT NULL,
    t5 NUMERIC(5,2) NOT NULL,
    t6 NUMERIC(5,2) NOT NULL,
    t7 NUMERIC(5,2) NOT NULL,
    t8 NUMERIC(5,2) NOT NULL,
    t9 NUMERIC(5,2) NOT NULL,
    temp_gradient NUMERIC(8,2) NOT NULL,
    calculated_k NUMERIC(8,2),
    steady_state VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Experiment Results Submissions Table
CREATE TABLE experiment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) UNIQUE NOT NULL REFERENCES experiment_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    material_id VARCHAR(50) NOT NULL,
    voltage NUMERIC(5,2) NOT NULL,
    current NUMERIC(5,2) NOT NULL,
    power NUMERIC(5,2) NOT NULL,
    water_flow_lmin NUMERIC(5,2) NOT NULL,
    t1 NUMERIC(5,2) NOT NULL,
    t2 NUMERIC(5,2) NOT NULL,
    t3 NUMERIC(5,2) NOT NULL,
    t4 NUMERIC(5,2) NOT NULL,
    t5 NUMERIC(5,2) NOT NULL,
    t6 NUMERIC(5,2) NOT NULL,
    t7 NUMERIC(5,2) NOT NULL,
    t8 NUMERIC(5,2) NOT NULL,
    t9 NUMERIC(5,2) NOT NULL,
    temp_gradient NUMERIC(8,2) NOT NULL,
    heat_input_w NUMERIC(8,2) NOT NULL,
    experimental_k NUMERIC(8,2) NOT NULL,
    reference_k NUMERIC(8,2) NOT NULL,
    percentage_error NUMERIC(5,2) NOT NULL,
    time_to_steady_state_sec INT NOT NULL,
    review_status review_status DEFAULT 'PENDING',
    teacher_feedback TEXT,
    graded_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_results ENABLE ROW LEVEL SECURITY;

-- RLS Policy Example: Students can only view their own experiment results
CREATE POLICY student_view_own_results ON experiment_results
    FOR SELECT USING (auth.uid() = student_id);

-- RLS Policy Example: Teachers can view results of students in their classes
CREATE POLICY teacher_view_class_results ON experiment_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = experiment_results.class_id 
            AND classes.teacher_id = auth.uid()
        )
    );
