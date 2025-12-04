-- Insert or Update T-House Vendor
INSERT INTO public.vendors (id, name, password_hash, tracking_route, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'T-House',
    'thouse', -- Password provided by user
    '/vendor/t-house',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    tracking_route = EXCLUDED.tracking_route;
