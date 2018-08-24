// Created by nickson on 7/12/2018
const express = require("express");
var bodyParser = require("body-parser");
const common = require("./common-code/common");
const backend = require("./backend");
const auth = require("./common-code/guests.js");
const AUTH_ARRAY = auth.CACHED_AUTH;
var app = express();
var cors = require("cors");

require("dotenv").load();

var allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://pick-a-seat.firebaseapp.com"
];

app.use(
    cors({
        origin: allowed_origins
    })
); // cors config
app.use(bodyParser.json());
app.post("/pick-a-seat", authenticateCustomer, pickASeat);
app.post("/check-seat-states", checkSeatStates);

async function pickASeat(request, response) {
    try {
        console.log("Picking a seat");
        let seat = request.body;
        seat["customer"].is_couple = getIsCouple(seat);
        if (validateSeatData(seat) === true) {
            let result = await backend.pickASeat(seat);
            if (result === true) {
                console.log(
                    `Successfuly picked seat ${seat.seat_number} from table ${
                        seat.table_number
                    }`
                );
                console.log("-----------------------------------");
                common.respondOK(response, true);
            } else {
                console.log("Failed to pick a seat, customer error");
                console.log("-----------------------------------");
                common.respondBR(response, result);
            }
        } else {
            common.respondBR(response, "Invalid seat data");
        }
    } catch (error) {
        console.log("Failed to pick a seat");
        console.log("-----------------------------------");
        common.respondISE(response, error);
    }
}

function validateSeatData(seat) {
    console.log("Validating:", seat);
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

// check seat states
async function checkSeatStates(request, response) {
    try {
        console.log("Checking seat states");
        let table = request["body"].table;
        let seats_states = await backend.checkSeatStates(table);
        console.log("Succeded in checking seat states");
        console.log("-----------------------------------");

        common.respondOK(response, seats_states);
    } catch (error) {
        console.log("Failed to check seat states");
        console.log("-----------------------------------");

        common.respondISE(response, error);
    }
}

// authenticate customer
// assuming basic token based authentication.
function authenticateCustomer(request, response, next) {
    console.log("-----------Request-------------");
    console.log("Authenticating customer");
    let parsed_request = request.body;
    let customer = parsed_request.customer;
    let email_address = customer.email_address;
    let ticket_number = customer.ticket_number;

    if (verify(email_address, ticket_number)) {
        console.log("Customer authenticated");
        return next();
    } else {
        console.log("Authentication failed");
        console.log("-------------------------------");
        response.status(401);
        return response.send();
    }
}

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

function getIsCouple(seat) {
    let email_address = seat["customer"].email_address;
    let ticket_number = seat["customer"].ticket_number;
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

module.exports = app;
