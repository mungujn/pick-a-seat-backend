// app access authentication 
const admin = require('firebase-admin')
// admin.initializeApp() // no need because initialized already in common.js
const common = require("./common");
const C = common.CONSTANTS;

//authenticate requests to the api
async function authorize(request, response, next) {
    console.log("Attempting authorization");
    let token_string = getAuthorizationTokenString(request);
    let decoded_token = await verifyToken(token_string);
    if (decoded_token === false) {
        console.log("Not authorized");
        respondNotAuthorized(response);
    } else {
        console.log(`Authorization succeded for ${decoded_token.uid}`);
        modifyRequestBody(request, decoded_token.uid);
        next();
    }
}

// retreive authorization tokens from the request
function getAuthorizationTokenString(request) {
    console.log("Retrieving authorization string from request");
    try {
        return request.get(C.AUTHORIZATION);
    } catch (error) {
        console.log("Error: ", error);
        return "";
    }
}

// verify a token string
// returns a decoded token
async function verifyToken(token_string){
    try {
        let decodedToken = await admin.auth().verifyIdToken(token_string)
        return decodedToken
    } catch (error) {
        console.log("Error verifying token: ", error);
    }
    return false
}

// modify the request body by adding the uid got from validating the token string
function modifyRequestBody(request, uid) {
    console.log(`Adding uid ${uid} to request body`);
    let body = request.body;
    body[C.REQ_UID] = uid;
    request.body = body;
}



async function verifyToken(token_string) {
    console.log(`Verifying token string ${token_string}`);
    try {
        let decodedToken = await admin.auth().verifyIdToken(token_string);
        return decodedToken;
    } catch (error) {
        console.log("Error verifying token: ", error);
    }
    return false;
}

function respondNotAuthorized(response) {
    response.status(401);
    response.send({
        code: 401,
        message: "Not authorized"
    });
}

module.exports.authorize = authorize;