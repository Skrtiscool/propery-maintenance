-- Seed a head admin user (password: ChangeMeImmediately123!)
-- Generate hash with: node -e "console.log(require('bcryptjs').hashSync('ChangeMeImmediately123!', 10))"
INSERT INTO users (email, password_hash, full_name, role, force_password_change)
VALUES (
    'admin',
    '$2a$10$tQplZYGSEQyStbHMLM6Cx.v2ls/FO2g8e0RWvCpIaPf1fWKpwNmdC',
    'Head Administrator',
    'HEAD_ADMIN',
    true
) ON CONFLICT (email) DO NOTHING;

-- Seed example property hierarchy
INSERT INTO properties (id, name, address)
VALUES ('a0000000-0000-4000-a000-000000000001', 'Sunset Apartments', '123 Main St, Springfield, IL')
ON CONFLICT DO NOTHING;

INSERT INTO buildings (id, property_id, name)
VALUES ('b0000000-0000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000001', 'Building A')
ON CONFLICT DO NOTHING;

INSERT INTO units (id, building_id, unit_number)
VALUES ('c0000000-0000-4000-a000-000000000001', 'b0000000-0000-4000-a000-000000000001', '101')
ON CONFLICT DO NOTHING;
