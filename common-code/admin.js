// database administrative operations 

const admin = require("firebase-admin");

// get the firestore db object thats used to interact with the db
function getDB() {
    return admin.firestore();
}

// create a document in the db at the specified location and give the documet
// an auto id
// takes odd pair addresses to a collection e.g collection/document/collection
async function createDataWithAutoID(location, data) {
    let nests = location.split("/");
    let db = getDB();
    let res;

    switch (nests.length) {
        case 3:
            console.log(
                `Creating data with auto id in collection ${
                    nests[2]
                } of document ${nests[1]} in collection ${nests[0]}`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .add(data);
            console.log("Create complete");
            return res.id;
        case 5:
            console.log(
                `Creating data with auto id in collection ${nests[4]} in doc ${
                    nests[3]
                } of collection ${nests[2]} in document ${
                    nests[1]
                } of collection ${nests[0]}`
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .add(data);
            console.log("Create complete");
            return res.id;
        case 7:
            console.log(
                `Creating data with auto id in collection ${nests[6]} ${
                    nests[5]
                } ${nests[4]} ${nests[3]} ${nests[2]} ${nests[1]} ${nests[0]} `
            );
            res = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .doc(nests[5])
                .collection(nests[6])
                .add(data);
            console.log("Create complete");
            return res.id;
    }
}

// get all documents in a specified location
// takes odd pair locations to a collection e.g collection/document/collection/document/collection
async function getAllDocumentsIn(location) {
    let nests = location.split("/");
    let db = getDB();
    let query_snapshot;
    let documents = [];

    switch (nests.length) {
        case 3:
            console.log(
                `Reading all data in collection ${nests[2]} of document ${
                    nests[1]
                } in collection ${nests[0]}`
            );
            query_snapshot = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .get();
            query_snapshot.forEach(doc => {
                documents.push(doc.data());
            });
            console.log("Get all complete");
            return documents;
        case 5:
            console.log(
                `Getting all data in collection ${nests[4]} in doc ${
                    nests[3]
                } of collection ${nests[2]} in document ${
                    nests[1]
                } of collection ${nests[0]}`
            );
            query_snapshot = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .get();
            query_snapshot.forEach(doc => {
                documents.push(doc.data());
            });
            console.log("Get all complete");
            return documents;
        case 7:
            console.log(
                `Getting all data in collection ${nests[6]} ${nests[5]} ${
                    nests[4]
                } ${nests[3]} ${nests[2]} ${nests[1]} ${nests[0]} `
            );
            query_snapshot = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .doc(nests[5])
                .collection(nests[6])
                .get();
            query_snapshot.forEach(doc => {
                documents.push(doc.data());
            });
            console.log("Get all complete");
            return documents;
    }
}

// gets all collections in a specified location. this function isnt available in
// client libraries
// takes even paired locations to a document e.g collection/document or col/doc/col/doc
async function getCollectionsIn(location) {
    let nests = location.split("/");
    let db = getDB();
    let collections;
    let data = [];
    switch (nests.length) {
        case 2:
            console.log(
                `Reading data in document ${nests[1]} in collection ${nests[0]}`
            );
            collections = await db
                .collection(nests[0])
                .doc(nests[1])
                .getCollections();
            collections.forEach(collection => {
                data.push(collection.id);
            });
            console.log("Read complete");
            return data;
        case 4:
            console.log(
                `Reading data in document ${nests[3]} in sub collection ${
                    nests[2]
                } of document ${nests[1]} in collection ${nests[0]}`
            );
            collections = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .getCollections();
            collections.forEach(collection => {
                data.push(collection.id);
            });
            console.log("Read complete");
            return data;
        case 6:
            console.log(
                `Reading data in document ${nests[5]} ${nests[4]} ${nests[3]} ${nests[2]} ${nests[1]} ${nests[0]}`
            );
            collections = await db
                .collection(nests[0])
                .doc(nests[1])
                .collection(nests[2])
                .doc(nests[3])
                .collection(nests[4])
                .doc(nests[5])
                .getCollections();
            collections.forEach(collection => {
                data.push(collection.id);
            });
            console.log("Read complete");
            return data;
    }
}

// deletes a collection
// takes path to collection and deletes in batches
function deleteCollection(collectionPath, batchSize) {
    let db = getDB()
    var collectionRef = db.collection(collectionPath);
    var query = collectionRef.orderBy("__name__").limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
}
// delete a collection
function deleteQueryBatch(db, query, batchSize, resolve, reject) {
    query
        .get()
        .then(snapshot => {
            // When there are no documents left, we are done
            if (snapshot.size == 0) {
                return 0;
            }

            // Delete documents in a batch
            var batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            return batch.commit().then(() => {
                return snapshot.size;
            });
        })
        .then(numDeleted => {
            if (numDeleted === 0) {
                resolve();
                return;
            }

            // Recurse on the next process tick, to avoid
            // exploding the stack.
            process.nextTick(() => {
                deleteQueryBatch(db, query, batchSize, resolve, reject);
            });
        })
        .catch(reject);
}

// exports
module.exports.getCollectionsIn = getCollectionsIn;
module.exports.createDataWithAutoID = createDataWithAutoID;
module.exports.deleteCollection = deleteCollection