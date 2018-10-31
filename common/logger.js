// Module for helping with logging
const utils = require('./utils');
var count = 0;
var base = 'service';

function start() {
    count = 0;
    base = utils.getUid();
}

function end() {
    console.info('----------*----------');
}
/**
 *
 * @param {string} message message to log
 */
function info(message) {
    console.info(`${base}::${count}::${message}`);
    count++;
}

/**
 *
 * @param {string} message message to log
 */
function log(message) {
    console.log(`${base}::${count}::${message}`);
    count++;
}

/**
 *
 * @param {string} message error message to log
 * @param {*} obj optional object to log
 */
function error(message, obj) {
    console.error(`${base}::${count}::${message}`);
    if (obj !== undefined) {
        console.log(obj);
    }
    count++;
}

module.exports.start = start;
module.exports.end = end;
module.exports.info = info;
module.exports.log = log;
module.exports.error = error;
