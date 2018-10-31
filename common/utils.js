// constants and functions that all microservices utilize
const admin = require('firebase-admin');
admin.initializeApp();
const uuidv4 = require('uuid/v4');

/**
 * get the current time (UTC)
 */
function now() {
    return new Date().toISOString().replace(/\..+/, '');
}

/**
 * get a shortened uuid (v4)
 */
function getShortUid() {
    let x = uuidv4();
    x = x.substr(0, 6);
    return x;
}

module.exports.now = now;
module.exports.getUid = getShortUid;
