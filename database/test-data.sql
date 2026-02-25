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
        'CUSTOMER',
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
        '123456',
        'demo item',
        'demo item demo item demo item',
        1.0,
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
        '{"beans": 123}'
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
        '{"name": "beans"}',
        'beans united',
        now(),
        '{"beans": 1234}'
    );
INSERT INTO box (
        id,
        upc,
        item,
        dimensions,
        count
    )
VALUES (
        6,
        '123456',
        '{"id": 6,"upc": "12345","name": "beans","descriptions": "beans are beans","weight": 1.0, "image": null}',
        '2x2x4',
        100
    );
INSERT INTO inventory (id, item, total, locations)
VALUES (
        6,
        '{"id": 6, "upc": "123456", "name": "beans", "description": "beans are beans are beans.", "weight": 2.3, "image": null}',
        1234,
        '{"A21": 1234}'
    );