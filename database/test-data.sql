INSERT INTO account (
    id,
    firstname,
    lastname,
    email,
    phone,
    username,
    password,
    role,
    active,
    created
)
VALUES (
    6,
    'demo',
    'account',
    'demo@account.net',
    '123-456-7890',
    'demo',
    'demo',
    'CUSTOMER',
    TRUE,
    now()
)
ON CONFLICT (id) DO UPDATE;

INSERT INTO item (
    id,
    upc,
    name,
    description,
    weight,
)
VALUES (
    6,
    '123456',
    'demo item',
    'demo item demo item demo item',
    1.0
)
ON CONFLICT (id) DO UPDATE;

INSERT INTO shipment (
    id,
    customer,
    address,
    ordered,
    payload
)
VALUES (
    6,
    '',
    '12345 N. Test Ave.',
    now(),
    '"beans": 123'
)
ON CONFLICT (id) DO UPDATE;

INSERT INTO box (
    id,
    upc,
    item,
    count
)
VALUES (
    6,
    '123456',
    'beans',
    123
)
ON CONFLICT (id) DO UPDATE;

INSERT INTO inventory (
    id,
    item,
    total,
    locations
)
VALUES (
    6,
    'beans',
    1234,
    '"A21": 1234'
)