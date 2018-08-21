// Created by nickson on 7/12/2018
const express = require("express");
var bodyParser = require("body-parser");
const common = require("./common-code/common");
const auth = require("./common-code/authentication");
const backend = require("./backend");
var app = express();
var cors = require("cors");

require("dotenv").load();

var allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://pamoja-wallet.firebaseapp.com"
];

app.use(
    cors({
        origin: allowed_origins,
        exposedHeaders: ["Authorization"]
    })
); // cors config
app.use(bodyParser.json());
app.post("/add", auth.authorize, handleAdd);
app.post("/begin-email-validation", beginEmailValidation);
app.post("/complete-email-validation", completeEmailValidation);
app.post("/edit", auth.authorize, handleEdit);
app.post("/remove", auth.authorize, handleRemove);

async function handleAdd(request, response) {
    try {
        console.log("Adding account");
        let account = request.body;
        let id = await backend.addAccount(account);
        console.log("Succeded in adding account");
        common.respondOK(response, id);
    } catch (error) {
        console.log("Failed to add account");
        common.respondISE(response, error);
    }
}

async function beginEmailValidation(request, response) {
    try {
        console.log("Sending validation email");
        let account = request.body;
        let id = await backend.beginEmailValidation(
            account.req_uid,
            account.validation_code
        );
        console.log("Succeded in sending validation email");
        common.respondOK(response, id);
    } catch (error) {
        console.log("Failed to send validation email");
        common.respondISE(response, error);
    }
}

async function completeEmailValidation(request, response) {
    try {
        console.log("Completing email validation");
        let req_body = request.body;
        let result = await backend.completeEmailValidation(req_body.uid, req_body.code);
        if (result === common.CONSTANTS.SUCCESSFUL) {
            console.log("Succeded in completing email validation");
            common.respondOK(response, result);
        } else {
            console.log("Failed to complete email validation");
            common.respondBR(response, result);
        }
    } catch (error) {
        console.log("Failed to complete email validation");
        common.respondISE(response, error);
    }
}

async function handleEdit(request, response) {
    try {
        console.log("Editing account");
        let account = request.body;
        let id = await backend.editAccount(account);
        console.log("Succeded in editing account");
        common.respondOK(response, id);
    } catch (error) {
        console.log("Failed to edit account");
        common.respondISE(response, error);
    }
}

async function handleRemove(request, response) {
    try {
        console.log("Removing account");
        let account = request.body;
        let id = await backend.removeAccount(account);
        console.log("Succeded in removing account");
        common.respondOK(response, id);
    } catch (error) {
        console.log("Failed to remove account");
        common.respondISE(response, error);
    }
}

module.exports = app;
