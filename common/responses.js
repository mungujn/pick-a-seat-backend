// THis module contains response objects
const log = require('./logger');
/**
 * Respond ok
 * @param {*} response Express response object
 * @param {string} message Information to send back
 */
function respondOK(response, message) {
    response.status(200);
    log.end();
    response.send({
        code: 200,
        message: message
    });
}

/**
 * Respond bad request, client side error
 * @param {*} response Express response object
 * @param {string} message Information to send back
 */
function respondBR(response, message) {
    log.info('Bad request: ', message);
    response.status(400);
    response.send({
        code: 400,
        message: message
    });
}

/**
 * Respond internal server error
 * @param {*} response Express response object
 * @param {*} error Error object to log
 */
function respondISE(response, error) {
    log.error('Error: ', error);
    response.status(500);
    response.send({
        code: 500,
        message: 'Internal server error'
    });
}

// exports
module.exports.respondOK = respondOK;
module.exports.respondBR = respondBR;
module.exports.respondISE = respondISE;
