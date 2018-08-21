// responses that the API gives

// respond ok, 
function respondOK(response, message) {
    response.status(200);
    response.send({
        code: 200,
        message: message
    });
}

// respond bad request, client side error
function respondBR(response, message) {
    console.log("Bad request: ", message);
    response.status(403);
    response.send({
        code: 403,
        message: message
    });
}

// respond internal server error
function respondISE(response, error) {
    console.log("Error: ", error);
    response.status(500);
    response.send({
        code: 500,
        message: "Internal server error"
    });
}

// exports
module.exports.respondOK = respondOK;
module.exports.respondBR = respondBR;
module.exports.respondISE = respondISE;
