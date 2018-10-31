const common = require('./common/functions');
const utils = require('./common/utils');
const log = require('./common/logger');
const db = require('./common/database');

async function pickASeat(seat) {
    let number_of_seats = await numberOfSeats(seat.customer);
    let seat_is_taken = await seatIsTaken(seat);
    let is_couple_ticket = await getTicketType(seat.customer);

    // Seat is empty and customer has not picked a seat yet
    if (
        seat_is_taken === false &&
        number_of_seats === 0 &&
        is_couple_ticket === false
    ) {
        log.info(
            '**\nSeat is empty and customer has not picked a seat yet\n**'
        );
        return await assignSeat(seat);
    }

    // seat is empty and customer has previously picked a seat
    if (
        seat_is_taken === false &&
        number_of_seats === 1 &&
        is_couple_ticket === false
    ) {
        log.info(
            '**\nseat is empty and customer has previously picked a seat\n**'
        );
        let requesters_old_seats = await getRequestersOldSeats(seat.customer);
        for (let i = 0; i < requesters_old_seats.length; i++) {
            await makeSeatEmpty(requesters_old_seats[i]);
        }
        return await assignSeat(seat);
    }

    // seat is empty and couple has picked no seats already
    if (
        seat_is_taken === false &&
        is_couple_ticket === true &&
        number_of_seats === 0
    ) {
        log.info(
            '**\nSeat is empty and couple has picked no seats already\n**'
        );
        return await assignSeat(seat);
    }

    // seat is empty and couple has picked 1 seat already
    if (
        seat_is_taken === false &&
        is_couple_ticket === true &&
        number_of_seats === 1
    ) {
        log.info(
            '**\nSeat is empty and couple has picked 1 seat already\n**'
        );
        return await assignSeat(seat);
    }

    // seat is empty and couple has picked 2 seats already
    if (
        seat_is_taken === false &&
        is_couple_ticket === true &&
        number_of_seats === 2
    ) {
        log.info(
            '**\nSeat is empty and couple has picked 2 seats already\n**'
        );
        let requesters_old_seats = await getRequestersOldSeats(seat.customer);
        for (let i = 0; i < requesters_old_seats.length; i++) {
            await makeSeatEmpty(requesters_old_seats[i]);
        }
        return await assignSeat(seat);
    }
    return 'Error: Seat taken';
}

function getTicketType(customer) {
    if (customer.is_couple === undefined) {
        return false;
    }
    return customer.is_couple;
}

async function makeSeatEmpty(seat) {
    let seat_data = await db.readData(
        `events/obuc-dinner/${seat.table}/${seat.seat}`
    );
    if (seat_data === undefined) {
        seat_data = {};
    }
    seat_data.taken = false;
    seat_data.ticket_number = '';
    seat_data.email_address = '';
    await db.updateData(
        `events/obuc-dinner/${seat.table}/${seat.seat}`,
        seat_data
    );
}

async function getRequestersOldSeats(customer) {
    let seat_data = await db.readData(
        `events/obuc-dinner-tickets/${customer.ticket_number}/seats`
    );
    let seats = seat_data.seats;
    return seats;
}

async function checkSeatStates(table_name) {
    let seat_states = [
        {},
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' },
        { taken: false, ticket_number: '' }
    ];
    let data = await db.getAllDocuments(`events/obuc-dinner/${table_name}`);
    log.log('Data', data);
    for (let i = 0; i < data.length; i++) {
        let x = data[i];
        if (x['data'].ticket_number === undefined) {
            seat_states[x.id].ticket_number = '';
        } else {
            if (x['data']['customer'].name !== undefined) {
                seat_states[x.id].ticket_number = `${
                    x['data'].ticket_number
                } , ${x['data']['customer'].name}`;
            } else {
                seat_states[x.id].ticket_number = x['data'].ticket_number;
            }
        }
        if (x['data'].taken === undefined) {
            seat_states[x.id].taken = false;
        } else {
            seat_states[x.id].taken = x['data'].taken;
        }
    }
    return seat_states;
}

async function seatIsTaken(seat) {
    log.log(
        `Checking if seat ${seat.seat} on table ${seat.table} is taken`
    );
    let seat_data = await db.readData(
        `events/obuc-dinner/${seat.table}/${seat.seat}`
    );
    if (seat_data === undefined) {
        log.log(`Seat is not yet assigned`);
        return false;
    } else {
        log.log(`Seat taken state is ${seat_data.taken}`);
        return seat_data.taken;
    }
}

async function assignSeat(seat) {
    /**/
    seat.taken = true;
    seat.ticket_number = seat['customer'].ticket_number;
    await db.updateData(
        `events/obuc-dinner/${seat.table}/${seat.seat}`,
        seat
    );
    await tallyCustomersSeatSelection(seat);
    return true;
    /**/
}

async function numberOfSeats(customer) {
    /**/
    let seats = await db.readData(
        `events/obuc-dinner-tickets/${customer.ticket_number}/seats`
    );
    if (seats === undefined) {
        return 0;
    } else {
        return seats.number;
    }
    /**/
}

async function tallyCustomersSeatSelection(seat) {
    let customers_seats = {};
    customers_seats = await db.readData(
        `events/obuc-dinner-tickets/${seat['customer'].ticket_number}/seats`
    );
    if (customers_seats === undefined) {
        customers_seats = {};
        customers_seats.number = 0;
        customers_seats['seats'] = [];
    } else {
        let is_couple_ticket = await getTicketType(seat.customer);

        if (is_couple_ticket === false) {
            customers_seats = {};
            customers_seats.number = 0;
            customers_seats['seats'] = [];
        }
    }
    customers_seats.number = customers_seats.number + 1;
    if (customers_seats.number === 3) {
        customers_seats.number = 1;
        customers_seats['seats'] = [];
    }
    customers_seats['seats'].push({
        seat: seat.seat,
        table: seat.table
    });
    log.log('Updating customers seats to: ', customers_seats);
    await db.updateData(
        `events/obuc-dinner-tickets/${seat['customer'].ticket_number}/seats`,
        customers_seats
    );
}

async function seatIsTakenByRequester(seat) {
    let seat_data = await db.readData(
        `events/obuc-dinner/${seat.table}/${seat.seat}`
    );
    if (seat_data === undefined) {
        return false;
    } else {
        if (
            seat['customer'].email_address ===
                seat_data['customer'].email_address &&
            seat['customer'].ticket_number ===
                seat_data['customer'].ticket_number
        ) {
            return true;
        }
        return false;
    }
}

module.exports.pickASeat = pickASeat;
module.exports.checkSeatStates = checkSeatStates;
module.exports.seatIsTaken = seatIsTaken;
module.exports.seatIsTakenByRequester = seatIsTakenByRequester;
module.exports.assignSeat = assignSeat;
module.exports.numberOfSeats = numberOfSeats;
module.exports.getRequestersOldSeats = getRequestersOldSeats;
module.exports.makeSeatEmpty = makeSeatEmpty;
module.exports.tallyCustomersSeatSelection = tallyCustomersSeatSelection;
