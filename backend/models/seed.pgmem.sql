INSERT INTO users (email, password_hash, full_name, role, force_password_change)
VALUES (
    'admin',
    '$2a$10$tQplZYGSEQyStbHMLM6Cx.v2ls/FO2g8e0RWvCpIaPf1fWKpwNmdC',
    'Head Administrator',
    'HEAD_ADMIN',
    true
) ON CONFLICT (email) DO NOTHING;
