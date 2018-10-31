// Created by nickson on 7/12/2018
require('@google-cloud/debug-agent').start();
const app = require('./app');

var server;
startServer();

function startServer() {
    server = app.listen(8080, () => {
        console.log('Server listening on port 8080');
    });
}

function stopServer() {
    server.close(() => {
        console.log('Server closed');
    });
}

module.exports.stopServer = stopServer;
