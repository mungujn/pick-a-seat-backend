// Created by nickson on 7/12/2018
const express = require('express');
var bodyParser = require('body-parser');
const responses = require('./common/responses');
const log = require('./common/logger');
const functions = require('./functions');
const AUTH_ARRAY = require('./common/guests.js');
var app = express();
var cors = require('cors');

require('dotenv').load();

var allowed_origins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://pick-a-seat.firebaseapp.com'
];

app.use(
    cors({
        origin: allowed_origins
    })
); // cors config
app.use(bodyParser.json());
app.post('/pick-a-seat', authenticateCustomer, pickASeat);
app.post('/check-seat-states', checkSeatStates);

/**
 * Handler function for the /pick-a-seat endpoint
 * @param {*} request Express request object
 * @param {*} response Express response object
 */
async function pickASeat(request, response) {
    try {
        log.start();
        log.info('Picking a seat');
        let seat = request.body;
        seat['customer'].is_couple = checkIfCouple(seat);
        seat['customer'].name = getName(seat);
        if (validateSeatData(seat) === true) {
            let result = await functions.pickASeat(seat);
            if (result === true) {
                log.info(
                    `Successfuly picked seat ${seat.seat_number} from table ${
                        seat.table_number
                    }`
                );
                log.info('-----------------------------------');
                responses.respondOK(response, true);
            } else {
                log.info('Failed to pick a seat, customer error');
                log.info('-----------------------------------');
                responses.respondBR(response, result);
            }
        } else {
            responses.respondBR(response, 'Invalid seat data');
        }
    } catch (error) {
        log.info('Failed to pick a seat');
        log.info('-----------------------------------');
        responses.respondISE(response, error);
    }
}

/**
 * Validate seat selection data
 * @param {*} seat Object containing seat data
 */
function validateSeatData(seat) {
    log.info('Validating:', seat);
    let customer = seat.customer;
    if (
        customer.is_couple !== undefined &&
        customer.ticket_number !== undefined &&
        customer.email_address !== undefined &&
        seat.table !== undefined &&
        seat.seat !== undefined
    ) {
        return true;
    }
    return false;
}

/**
 * Handler function for the /check-seat-states endpoint
 * @param {*} request Express request object
 * @param {*} response Express response object
 */
async function checkSeatStates(request, response) {
    try {
        log.start();
        log.info('Checking seat states');
        let table = request['body'].table;
        let seats_states = await functions.checkSeatStates(table);
        log.info('Succeded in checking seat states');
        log.info('-----------------------------------');

        responses.respondOK(response, seats_states);
    } catch (error) {
        log.info('Failed to check seat states');
        log.info('-----------------------------------');

        responses.respondISE(response, error);
    }
}

/**
 * authenticate customer
 * @param {*} request Express request object
 * @param {*} response Express response object
 * @param {*} next Function to call if auth passes
 */
function authenticateCustomer(request, response, next) {
    log.info('-----------Request-------------');
    log.info('Authenticating customer');
    let parsed_request = request.body;
    let customer = parsed_request.customer;
    let email_address = customer.email_address;
    let ticket_number = customer.ticket_number;

    if (verify(email_address, ticket_number)) {
        log.info('Customer authenticated');
        return next();
    } else {
        log.info('Authentication failed');
        log.info('-------------------------------');
        response.status(401);
        return response.send();
    }
}

/**
 * Verify that the customer selecting a seat paid for it
 * @param {string} email_address Customers email address
 * @param {string} ticket_number Customers ticket number
 */
function verify(email_address, ticket_number) {
    for (let i = 0; i < AUTH_ARRAY.length; i++) {
        let pair = AUTH_ARRAY[i];
        if (
            email_address === pair.email_address &&
            ticket_number === pair.ticket_number
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Check if a seat selection request is from a customer that bought a couples ticket
 * @param {*} seat Object containing seat details
 */
function checkIfCouple(seat) {
    let email_address = seat['customer'].email_address;
    let ticket_number = seat['customer'].ticket_number;
    for (let i = 0; i < AUTH_ARRAY.length; i++) {
        let pair = AUTH_ARRAY[i];
        if (
            email_address === pair.email_address &&
            ticket_number === pair.ticket_number
        ) {
            if (pair.is_couple !== undefined) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Get the name of a customer associated with a particular seat
 * @param {*} seat Seat object
 */
function getName(seat) {
    let email_address = seat['customer'].email_address;
    let ticket_number = seat['customer'].ticket_number;
    for (let i = 0; i < AUTH_ARRAY.length; i++) {
        let pair = AUTH_ARRAY[i];
        if (
            email_address === pair.email_address &&
            ticket_number === pair.ticket_number
        ) {
            if (pair.name !== undefined) {
                return pair.name;
            }
        }
    }
    return '';
}

module.exports = app;
