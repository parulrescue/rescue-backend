-- Adds rescue_date column (defaults to CURRENT_TIMESTAMP for future inserts)
ALTER TABLE rescues ADD COLUMN rescue_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER created_by;

-- Backfill existing rows so rescue_date matches each row's original createdAt
UPDATE rescues SET rescue_date = createdAt;
