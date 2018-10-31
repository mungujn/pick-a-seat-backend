const backend = require('../backend');
const common = require('../common-code/common');
const request = require('supertest');
const app = require('../app');

jest.setTimeout(60000);

describe('API', () => {
    // Seat is empty and customer has not picked a seat yet
    // pickASeat
    test('Seat is empty and customer has not picked a seat yet', async () => {
        // prepare
        await common.deleteData(`events/obuc-dinner/table-t/1`);
        await common.deleteData(`events/obuc-dinner-tickets/1/seats`);
        // test
        let response = await request(app)
            .post('/pick-a-seat')
            .send({
                table: 'table-t',
                seat: '1',
                customer: {
                    ticket_number: '1',
                    email_address: 'test@gmail.com'
                }
            });

        let object = response['body'].message;
        console.log(object);
        // assert
        expect(object).toBe(true);
    });

    //pickASeat
    test('seat is empty and customer has previously picked a seat', async () => {
        // prepare
        await common.deleteData(`events/obuc-dinner/table-t/1`);
        await common.createData(`events/obuc-dinner/table-t/2`, {
            taken: true
        });
        await common.createData(`events/obuc-dinner-tickets/1/seats`, {
            number: 1,
            seats: [
                {
                    table: 'table-t',
                    seat: '2'
                }
            ]
        });
        // test
        let response = await request(app)
            .post('/pick-a-seat')
            .send({
                table: 'table-t',
                seat: '1',
                customer: {
                    ticket_number: '1',
                    email_address: 'test@gmail.com'
                }
            });

        // assert
        let data = await common.readData(`events/obuc-dinner-tickets/1/seats`);
        expect(data.number).toEqual(1);
        expect(data.seats).toHaveLength(1);
        expect(data['seats'][0]).toEqual({
            table: 'table-t',
            seat: '1'
        });
        let old_seat = await common.readData(`events/obuc-dinner/table-t/2`);
        expect(old_seat.taken).toBe(false);
        let object = response['body'].message;
        expect(object).toBe(true);
    });

    //pickASeat
    // seat is empty and couple has picked no seats already
    test('Seat is empty and couple has picked no seats already', async () => {
        // prepare
        await common.deleteData(`events/obuc-dinner/table-t/2`);
        await common.deleteData(`events/obuc-dinner-tickets/2/seats`);
        // test
        let response = await request(app)
            .post('/pick-a-seat')
            .send({
                table: 'table-t',
                seat: '2',
                customer: {
                    ticket_number: '2',
                    email_address: 'test2@gmail.com',
                    is_couple: true
                }
            });

        let object = response['body'].message;
        console.log(object);
        // assert
        expect(object).toBe(true);
    });

    // seat is empty and couple has picked 1 seat already
    test('seat is empty and couple has picked 1 seat already', async () => {
        // prepare
        await common.deleteData(`events/obuc-dinner/table-t/3`);
        await common.createData(`events/obuc-dinner-tickets/2/seats`, {
            number: 1,
            seats: [
                {
                    table: 'table-t',
                    seat: '2'
                }
            ]
        });

        // test
        let response = await request(app)
            .post('/pick-a-seat')
            .send({
                table: 'table-t',
                seat: '3',
                customer: {
                    ticket_number: '2',
                    email_address: 'test2@gmail.com',
                    is_couple: true
                }
            });

        // assert
        let data = await common.readData(`events/obuc-dinner-tickets/2/seats`);
        expect(data['number']).toEqual(2);
        expect(data['seats'].length).toEqual(2);
        let object = response['body'].message;
        expect(object).toBe(true);
    });

    // seat is empty and couple has picked 2 seats already
    test('seat is empty and couple has picked 2 seats already', async () => {
        // prepare
        await common.deleteData(`events/obuc-dinner/table-t/4`);
        await common.createData(`events/obuc-dinner-tickets/2/seats`, {
            number: 2,
            seats: [
                {
                    table: 'table-t',
                    seat: '2'
                },
                {
                    table: 'table-t',
                    seat: '3'
                }
            ]
        });
        // test
        let response = await request(app)
            .post('/pick-a-seat')
            .send({
                table: 'table-t',
                seat: '4',
                customer: {
                    ticket_number: '2',
                    email_address: 'test2@gmail.com',
                    is_couple: true
                }
            });
        // assert
        let data = await common.readData(`events/obuc-dinner-tickets/2/seats`);
        expect(data['number']).toEqual(1);
        expect(data['seats'].length).toEqual(1);
        let object = response['body'].message;
        expect(object).toBe(true);
    });

    // checkSeatStates
    test('Gets table seats', async () => {
        // prepare

        // test
        let response = await request(app)
            .post('/check-seat-states')
            .send({
                table: 'table-t'
            });

        let object = response['body'].message;
        console.log(object);
        // assert
        expect(object.length).toBeGreaterThanOrEqual(3);
    });

    afterAll('After all', ()=>{
        process.exit()
    });
});

describe('Unit tests', () => {
    //seatIsTaken
    test('Seat taken by someone else', async () => {
        // prepare

        // test
        let taken = await backend.seatIsTaken({
            table: 'table-t',
            seat: '1'
        });
        // assert
        expect(taken).toBe(true);
    });

    test('Seat not taken by someone else', async () => {
        // prepare

        // test
        let taken = await backend.seatIsTaken({
            table: 'table-t',
            seat: '2'
        });
        // assert
        expect(taken).toBe(false);
    });

    //seatIsTakenByRequester
    test('Seat taken by requester', async () => {
        // prepare

        // test
        let taken = await backend.seatIsTakenByRequester({
            table: 'table-t',
            seat: '3',
            customer: {
                email_address: 'test@gmail.com',
                ticket_number: '123'
            }
        });
        // assert
        expect(taken).toBe(true);
    });

    // seatIsTakenByRequester
    test('Seat is not taken by requester', async () => {
        // prepare

        // test
        let taken = await backend.seatIsTakenByRequester({
            table: 'table-t',
            seat: '3',
            customer: {
                email_address: 'test@gmail.com',
                ticket_number: '1234'
            }
        });
        // assert
        expect(taken).toBe(false);
    });

    // assignSeat
    test('Assign seat', async () => {
        // prepare
        let seat = {
            table: 'table-t',
            seat: '4',
            customer: {
                email_address: 'test@gmail.com',
                ticket_number: '1234'
            }
        };
        // test
        let taken = await backend.assignSeat(seat);

        let data = await common.readData(`events/obuc-dinner/table-t/4`);

        // assert
        expect(data).toEqual(seat);
    });

    //numberOfSeats
    test('Find number of seats', async () => {
        // prepare
        let customer = {
            email_address: 'test@gmail.com',
            ticket_number: '1234'
        };
        // test
        let number = await backend.numberOfSeats(customer);

        // assert
        expect(number).toEqual(2);
    });

    // getRequestersOldSeats
    test('Get requesters old seats', async () => {
        // prepare
        let customer = {
            ticket_number: '1234'
        };
        // test
        let seats = await backend.getRequestersOldSeats(customer);

        // assert
        expect(seats.length).toEqual(2);
    });

    // makeSeatEmpty
    test('Make seat empty', async () => {
        // prepare
        let seat = {
            table: 'table-t',
            seat: '9'
        };
        // test
        await backend.makeSeatEmpty(seat);
        let data = await common.readData(`events/obuc-dinner/table-t/9`);

        // assert
        expect(data.taken).toBe(false);
    });

    // tallyCustomersSeatSelection
    test('Make seat empty', async () => {
        // prepare
        let seat = {
            table: 'table-t',
            seat: '9',
            customer: {
                ticket_number: '1234'
            }
        };
        // test
        await backend.tallyCustomersSeatSelection(seat);
        let data = await common.readData(
            `events/obuc-dinner-tickets/1234/seats`
        );

        // assert
        expect(data.seats.length).toBeGreaterThanOrEqual(1);
        expect(data.seats[data.seats.length - 1]).toEqual({
            table: 'table-t',
            seat: '9'
        });
    });
});
