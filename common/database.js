// This module contains code to create, read, update and delete data from the database (cloud firestore)
const admin = require('firebase-admin');
const log = require('./logger');

/**
 * Gets the firebase db object/connection
 */
function getDB() {
    return admin.firestore();
}

/**
 * Create data in the database
 * @param {string} location '/' separated string containing the full data target-location
 * @param {*} data
 */
async function createData(location, data) {
    let nodes = location.split('/');
    let db = getDB();
    let res;

    switch (nodes.length) {
        case 2:
            log.info(
                `Creating data in document ${nodes[1]} in collection ${
                    nodes[0]
                }`
            );
            res = await db
                .collection(nodes[0])
                .doc(nodes[1])
                .set(data);
            log.info('Create complete');
            return res;
        case 4:
            log.info(
                `Creating data in document ${nodes[3]} in sub collection ${
                    nodes[2]
                } of document ${nodes[1]} in collection ${nodes[0]}`
            );
            res = await db
                .collection(nodes[0])
                .doc(nodes[1])
                .collection(nodes[2])
                .doc(nodes[3])
                .set(data);
            log.info('Create complete');
            return res;
        case 6:
            log.info(
                `document ${nodes[5]} collection ${nodes[4]} document ${
                    nodes[3]
                } collection ${nodes[2]} document ${nodes[1]} collection ${
                    nodes[0]
                }`
            );
            res = await db
                .collection(nodes[0])
                .doc(nodes[1])
                .collection(nodes[2])
                .doc(nodes[3])
                .collection(nodes[4])
                .doc(nodes[5])
                .set(data);
            log.info('Create complete');
            return res;
    }
}

/**
 * Read data from the database. Returns js object with data
 * @param {string} location '/' separated address to a document
 */
async function readData(location) {
    let nests = location.split('/');
    let db = getDB();
    let doc;
    let data;
    switch (nests.length) {
        case 2:
            log.info(
                `Reading data in document ${nests[1]} in collection ${nests[0]}`
            );
            doc = await db
                .collection(nests[0])
                .doc(nests[1])
                .get();
            data = doc.data();
            log.info('Read complete');
            return data;
        case 4:
            log.info(
                `Reading data in document ${nests[3]} in sub collection ${
                    nests[2]
                } of document ${nests[1]} in collection ${nests[0]}`
            );
            doc = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .get();
            data = doc.data();
            log.info('Read complete');
            return data;
        case 6:
            log.info(
                `getting data in document ${nests[5]} collection ${
                    nests[4]
                } document ${nests[3]} collection ${nests[2]} document ${
                    nests[1]
                } collection ${nests[0]}`
            );
            doc = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .doc(nests[5])
                .get();
            data = doc.data();
            log.info('Read complete');
            return data;
    }
}

/**
 * update data in the database
 * @param {string} location '/' separated full address to a document,
 * @param {*} data object to write to db
 */
async function updateData(location, data) {
    let nests = location.split('/');
    let db = getDB();

    switch (nests.length) {
        case 2:
            log.info(
                `Updating data in document ${nests[1]} in collection ${
                    nests[0]
                }`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .set(data, { merge: true });
            log.info('Update complete at: ', res);
            break;
        case 4:
            log.info(
                `Updating data in document ${nests[3]} in sub collection ${
                    nests[2]
                } of document ${nests[1]} in collection ${nests[0]}`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .set(data, { merge: true });
            log.info('Update complete at: ', res);
            break;
        case 6:
            log.info(
                `Udpdating data in document ${nests[5]} collection ${
                    nests[4]
                } document ${nests[3]} collection ${nests[2]} document ${
                    nests[1]
                } collection ${nests[0]}`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .doc(nests[5])
                .set(data, { merge: true });
            log.info('Update complete at: ', res);
            break;
    }
}

/**
 * remove data from the database
 * @param {string} location '/' separated full address to the document to delete
 */
async function deleteData(location) {
    let nests = location.split('/');
    let db = getDB();

    switch (nests.length) {
        case 2:
            log.info(
                `Deleting data in document ${nests[1]} in collection ${
                    nests[0]
                }`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .delete();
            log.info('Delete complete at: ', res);
            break;
        case 4:
            log.info(
                `Updating data in document ${nests[3]} in sub collection ${
                    nests[2]
                } of document ${nests[1]} in collection ${nests[0]}`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .delete();
            log.info('Delete complet at: ', res);
            break;
        case 4:
            log.info(
                `Deleting data in document ${nests[5]} collection ${
                    nests[4]
                } document ${nests[3]} collection ${nests[2]} document ${
                    nests[1]
                } collection ${nests[0]}`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .doc(nests[5])
                .delete();
            log.info('Delete complet at: ', res);
            break;
    }
}

/**
 * read all documents from a collection
 * @param {string} location '/' separated full address to the collection to retrieve
 */
async function getAllDocuments(location) {
    let nests = location.split('/');
    let db = getDB();
    let ref;
    let snapshot;
    let data = [];
    switch (nests.length) {
        case 1:
            log.info(`Reading all data in collection ${nests[0]}`);
            snapshot = await db.collection(nests[0]).get();
            snapshot.forEach(doc => {
                data.push(doc.data());
            });
            log.info('Read complete');
            return data;
        case 3:
            log.info(
                `Reading data in sub collection ${nests[2]} of document ${
                    nests[1]
                } in collection ${nests[0]}`
            );
            ref = db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2]);
            snapshot = await ref.get();
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            log.info('Read complete');
            return data;
    }
}

// exports
module.exports.getDB = getDB;
module.exports.createData = createData;
module.exports.readData = readData;
module.exports.updateData = updateData;
module.exports.deleteData = deleteData;
module.exports.getAllDocuments = getAllDocuments;
