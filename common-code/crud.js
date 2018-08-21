// create, read, update and delete database operations
const admin = require("firebase-admin");
const local_admin = require("./admin")

// get the db object/connection
function getDB() {
    return admin.firestore();
}

// create data in the database
// location is an address to a document, data is a js object
async function createData(location, data) {
    let nests = location.split("/");
    let db = getDB();
    let res;

    switch (nests.length) {
        case 2:
            console.log(
                `Creating data in document ${nests[1]} in collection ${
                    nests[0]
                }`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .set(data);
            console.log("Create complete");
            return res;
        case 4:
            console.log(
                `Creating data in document ${nests[3]} in sub collection ${
                    nests[2]
                } of document ${nests[1]} in collection ${nests[0]}`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .set(data);
            console.log("Create complete");
            return res;
        case 6:
            console.log(
                `document ${nests[5]} collection ${nests[4]} document ${
                    nests[3]
                } collection ${nests[2]} document ${nests[1]} collection ${
                    nests[0]
                }`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .doc(nests[5])
                .set(data);
            console.log("Create complete");
            return res;
    }
}

// read data from the database
// location is an address to a document, returns js object with data
async function readData(location) {
    let nests = location.split("/");
    let db = getDB();
    let doc;
    let data;
    switch (nests.length) {
        case 2:
            console.log(
                `Reading data in document ${nests[1]} in collection ${nests[0]}`
            );
            doc = await db
                .collection(nests[0])
                .doc(nests[1])
                .get();
            data = doc.data();
            console.log("Read complete");
            return data;
        case 4:
            console.log(
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
            console.log("Read complete");
            return data;
        case 6:
            console.log(
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
            console.log("Read complete");
            return data;
    }
}

// update data in the database
// location is an address to a document, js object with data to update with
async function updateData(location, data) {
    let nests = location.split("/");
    let db = getDB();

    switch (nests.length) {
        case 2:
            console.log(
                `Updating data in document ${nests[1]} in collection ${
                    nests[0]
                }`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .set(data, { merge: true });
            console.log("Update complete at: ", res);
            break;
        case 4:
            console.log(
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
            console.log("Update complete at: ", res);
            break;
        case 6:
            console.log(
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
            console.log("Update complete at: ", res);
            break;
    }
}

// remove data from the database
// location is an address to a document, returns operation time
async function deleteData(location) {
    let nests = location.split("/");
    let db = getDB();

    switch (nests.length) {
        case 2:
            console.log(
                `Deleting data in document ${nests[1]} in collection ${
                    nests[0]
                }`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .delete();
            console.log("Delete complete at: ", res);
            break;
        case 4:
            console.log(
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
            console.log("Delete complet at: ", res);
            break;
        case 4:
            console.log(
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
            console.log("Delete complet at: ", res);
            break;
    }
}

// exports
module.exports.getDB = getDB;
module.exports.createData = createData;
module.exports.readData = readData;
module.exports.updateData = updateData;
module.exports.deleteData = deleteData;

// exports from the custom admin.js file
module.exports.deleteCollection = local_admin.deleteCollection
module.exports.getCollectionsIn = local_admin.getCollectionsIn;
module.exports.createDataWithAutoID = local_admin.createDataWithAutoID;