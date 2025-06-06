module.exports = {
    company: {
        users: 'RESTRICT',
        catalogs: 'CASCADE',
        parameters: 'CASCADE',
        vehicles: 'CASCADE',
        trips: 'CASCADE',
        clients: 'CASCADE',
    },
    user: {
        roles: 'CASCADE',
        client: 'SET_NULL',
    },
    client: {
        orders: 'CASCADE',
        ordersAsOrigin: 'CASCADE',
        ordersAsDestination: 'CASCADE',
        users: 'SET_NULL',
    },
    catalog: {
        orders: 'RESTRICT',
        productsOrders: 'CASCADE',
    },
    order: {
        productsOrders: 'CASCADE',
    },
    employee: {
        operator: 'CASCADE',
        user: 'SET_NULL',
    },
    operator: {
        vehicles: 'RESTRICT',
    },
    vehicle: {
        trips: 'RESTRICT',
    },
    paymenttype: {
        employees: 'RESTRICT',
    },
    trip: {
        orders: 'RESTRICT',
        evidences: 'RESTRICT',
    },
    evidencetype: {
        evidences: 'RESTRICT',
    },
    evidence: {
        photos: 'CASCADE',
    },
    country: {
        directions: 'CASCADE',
    },
    location: {
        originSegments: 'SET_NULL',
        destinationSegments: 'SET_NULL',
        segments: 'CASCADE',
    },
    segment: {
        routes: 'RESTRICT',
        locations: 'RESTRICT',
        originLocation: 'SET_NULL',
        destinationLocation: 'SET_NULL',
    },
    route: {
        segments: 'CASCADE',
        trips: 'RESTRICT',
    },
};
