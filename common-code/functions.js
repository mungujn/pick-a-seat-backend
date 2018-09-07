// constants and functions that all microservices utilize
const admin = require("firebase-admin");
admin.initializeApp();
const uuidv4 = require("uuid/v4");
const crud = require("./crud");
const responses = require("./responses");

// const BASE = "";
// constants
const C = {
    // root level nodes
    EVENTS: "events"
};

// get the current time (on the server)
function now() {
    return new Date().toISOString().replace(/\..+/, "");
}

// generate a universal unique identifier
function generateUID() {
    let x = uuidv4();
    return x;
}

// exports
module.exports.respondOK = responses.respondOK;
module.exports.respondBR = responses.respondBR;
module.exports.respondISE = responses.respondISE;

module.exports.CONSTANTS = C;
module.exports.now = now;
module.exports.generateUID = generateUID;

// exports from the db operations crud module
module.exports.getDB = crud.getDB;
module.exports.createData = crud.createData;
module.exports.readData = crud.readData;
module.exports.updateData = crud.updateData;
module.exports.deleteData = crud.deleteData;
module.exports.getAllDocuments = crud.getAllDocuments;
