-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS floodmonitoring_db;
USE floodmonitoring_db;

-- Create users table
CREATE TABLE IF NOT EXISTS mob_app_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) DEFAULT '0000000000',
    login_method VARCHAR(50) DEFAULT 'email',
    status VARCHAR(50) DEFAULT 'active',
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert a test user (password: test123)
INSERT INTO mob_app_users (full_name, email, password, phone_number, login_method, status, role) 
VALUES ('Test User', 'test@example.com', 'test123', '1234567890', 'email', 'active', 'user')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Create user_flood_reports table
CREATE TABLE IF NOT EXISTS user_flood_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(255),
    level VARCHAR(50) NOT NULL,
    description TEXT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 