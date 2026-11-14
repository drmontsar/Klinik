-- up
ALTER TABLE staff.users ADD COLUMN app_access_enabled boolean NOT NULL DEFAULT true;

-- down
ALTER TABLE staff.users DROP COLUMN app_access_enabled;
