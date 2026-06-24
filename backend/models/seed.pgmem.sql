INSERT INTO users (email, password_hash, full_name, role, force_password_change)
VALUES (
    'admin',
    '$2a$10$p8eNExkajU/SH9YBon07GOykzU1dDqtRhgPBJe.6T3qupCvoWtG3y',
    'Head Administrator',
    'HEAD_ADMIN',
    false
) ON CONFLICT (email) DO NOTHING;
