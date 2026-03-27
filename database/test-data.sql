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
        '$argon2id$v=19$m=65536,t=2,p=4$l9PScIRodmhb0971T2eMhw$yhnLpfn1P/BW0AK+yTkeR0G7Ao7uFOKATgjbiiIhobI',
        'EMPLOYEE',
        TRUE,
        now()
    ),
    (
        7,
        'admin',
        'account',
        'admin@account.dev',
        '123-456-7890',
        'admin',
        '$argon2id$v=19$m=65536,t=2,p=4$9TL1aNMapp4lwnhJZVrqIQ$hJ15MEEE+Z23ckNRx/ZYzsk54Srnjcqj6yTe+0eRADA',
        'ADMIN',
        TRUE,
        now()
    );
INSERT INTO item (
        id,
        upc,
        name,
        description,
        weight,
        image
    )
VALUES (
        6,
        '308910547289',
        'demo item01',
        'demo item 1 demo item 1 demo item 1',
        1.0,
        NULL
    ),
    (
        7,
        '331987488605',
        'demo item02',
        'demo item 2 demo item 2 demo item 2',
        2.0,
        NULL
    ),
    (
        8,
        '437033603890',
        'demo item03',
        'demo item 3 demo item 3 demo item 3',
        3.5,
        NULL
    ),
    (
        9,
        '675940481013',
        'demo item04',
        'demo item 4 demo item 4 demo item 4',
        4.2,
        NULL
    ),
    (
        10,
        '764995274807',
        'demo item05',
        'demo item 5 demo item 5 demo item 5',
        5.7,
        NULL
    );
INSERT INTO order_data (
        id,
        customer,
        address,
        timeOrdered,
        payload
    )
VALUES (
        6,
        '{"name": "demo"}',
        '12345 N. Test Ave.',
        now(),
        '[{"item_id": 6,"count": 123}]'
    );
INSERT INTO shipment (
        id,
        supplier,
        distributor,
        eta,
        payload
    )
VALUES (
        6,
        '{"name": "beans sup"}',
        'beans united',
        now(),
        '[{"item_id": 6,"count": 123}]'
    );
INSERT INTO box (
        id,
        upc,
        dimensions,
        count,
        item_id
    )
VALUES (
        6,
        '123456',
        '2x2x4',
        100,
        6
    ),
    (
        7,
        '234567',
        '1x3x8',
        40,
        7
    ),
    (
        8,
        '345678',
        '5x5x5',
        250,
        8
    ),
    (
        9,
        '456789',
        '10x25x6',
        20,
        9
    ),
    (
        10,
        '567890',
        '8x16x4',
        16,
        10
    );
INSERT INTO inventory (id, item_id, total, locations)
VALUES (
        6,
        6,
        2456,
        '[{"area":"A21","count":1234},{"area":"B3","count":1222},{"area":"Stock","count":0}]'
    ),
    (
        7,
        7,
        1234,
        '[{"area":"A1","count":617},{"area":"C4","count":617},{"area":"Stock","count":0}]'
    ),
    (
        8,
        8,
        3000,
        '[{"area":"A4","count":1000},{"area":"B5","count":1000},{"area":"C7","count":500},{"area":"D9","count":500},{"area":"Stock","count":0}]'
    ),
    (
        9,
        9,
        600,
        '[{"area":"A13","count":200},{"area":"B10","count":200},{"area":"C1","count":200},{"area":"Stock","count":0}]'
    ),
    (
        10,
        10,
        64,
        '[{"area":"A20","count":32},{"area":"B20","count":32},{"area":"Stock","count":0}]'
    );