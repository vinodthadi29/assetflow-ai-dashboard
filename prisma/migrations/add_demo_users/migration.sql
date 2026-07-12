-- Create demo admin user (password: Admin123456, hashed with bcrypt)
INSERT INTO "User" (id, email, name, password, role, "isActive", "failedLoginAttempts", "createdAt", "updatedAt") 
VALUES (
  'admin-user-001',
  'admin@assetflow.com',
  'Admin User',
  '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2',
  'ADMIN',
  true,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create asset manager user
INSERT INTO "User" (id, email, name, password, role, "isActive", "failedLoginAttempts", "createdAt", "updatedAt") 
VALUES (
  'manager-user-001',
  'manager@assetflow.com',
  'Asset Manager',
  '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2',
  'ASSET_MANAGER',
  true,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create test employee user
INSERT INTO "User" (id, email, name, password, role, "isActive", "failedLoginAttempts", "createdAt", "updatedAt") 
VALUES (
  'employee-user-001',
  'employee@assetflow.com',
  'Test Employee',
  '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2',
  'EMPLOYEE',
  true,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
