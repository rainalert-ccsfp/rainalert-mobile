USE floodmonitoring_db;

-- Drop the old table if it exists to ensure a clean setup
DROP TABLE IF EXISTS flood_records;

-- Create the table with the correct schema
CREATE TABLE IF NOT EXISTS flood_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `year` INT NOT NULL,
    `month` VARCHAR(20) NOT NULL,
    barangay VARCHAR(255) NOT NULL,
    flood_depth_m DECIMAL(5, 2) NOT NULL,
    duration_hours INT NOT NULL,
    cause VARCHAR(255) NOT NULL
);

-- Insert new sample data matching the provided schema
INSERT INTO flood_records (`year`, `month`, barangay, flood_depth_m, duration_hours, cause) VALUES
(2022, 'January', 'San Jose', 0.5, 3, 'Heavy Rainfall'),
(2022, 'July', 'Dolores', 1.2, 6, 'River Overflow'),
(2022, 'July', 'San Agustin', 0.8, 4, 'Poor Drainage'),
(2022, 'September', 'San Jose', 1.5, 8, 'Typhoon'),
(2023, 'February', 'Telabastagan', 0.3, 2, 'Heavy Rainfall'),
(2023, 'August', 'Dolores', 1.8, 12, 'Monsoon'),
(2023, 'August', 'San Agustin', 1.1, 7, 'River Overflow'),
(2023, 'October', 'San Jose', 0.7, 5, 'Heavy Rainfall'),
-- Additional data for 2024
(2024, 'January', 'Bulaon', 0.4, 2, 'Localized Thunderstorm'),
(2024, 'February', 'San Juan', 0.6, 4, 'Poor Drainage'),
(2024, 'March', 'Sta. Teresita', 0.3, 3, 'Heavy Rainfall'),
(2024, 'April', 'San Nicolas', 0.8, 5, 'River Swelling'),
(2024, 'May', 'Maimpis', 1.1, 7, 'Monsoon Rains'),
(2024, 'June', 'Del Carmen', 1.4, 9, 'Typhoon Aftermath');
