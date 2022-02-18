const express = require('express'); 
const app = express();
const port = 3000;
const validate = require('./validate');
const token = 'eyJhdF9oYXNoIjoiYUNnc2lmdkwtWHh1OHRKYlhfSHFUdyIsInN1YiI6Ijc5ZWU4MTVlLTIxN2UtNDBkMy04OTdjLTJhNGYyNTNjMTE1NyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfNHVaTXpDVGd2IiwiY29nbml0bzp1c2VybmFtZSI6InNhbS5ib25nQGFsZXhzb2x1dGlvbnMuY29tLmF1IiwiYXVkIjoiNjMzaWtzZThrYXRoc2VjOWtzYzZtMXFwcXIiLCJldmVudF9pZCI6IjQ2MWQzOTc5LWFlYTQtNDE4NS05OWJkLTQ2M2UwZjg2MjVkMyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjQ1MTUzNDk0LCJleHAiOjE2NDUxNTcwOTQsImlhdCI6MTY0NTE1MzQ5NSwianRpIjoiNjI1MjdlYjUtZDc5ZS00YjdmLWEwMGEtMjM2NzBlNzYyMDAwIiwiZW1haWwiOiJzYW0uYm9uZ0BhbGV4c29sdXRpb25zLmNvbS5hdSJ9';

// Serve static files from folder called public
app.use("/app", express.static("static"));

// Respond to a an API request
app.get("/", (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.send({message: "Hello friend"});
});

// Start the server
app.listen(port, () => console.log("Server listening on port " + port));

// Authentication / authorisation middleware
app.use((request, response, next) => {

    response.setHeader('Content-Type', 'application/json');

    // We need an authorization header
    if (!request.headers || !request.headers.authorization) {
        send401(response, new Error("Missing authorization header"));

    // We need the authorization header to be a "bearer" header
    } else if (request.headers.authorization.substr(0, 7).toLowerCase() !== "bearer ") {
        send401(response, new Error("Authorization header is not a bearer header"));

    // So, we've got a token, which we validate.  If the validation is
    // successful, we send the requested response.  If the validation fails,
    // we send a 401 response (which includes the error from the validation).
    } else {
        validate(request.headers.authorization.substr(7),
                 (success) => { next(); },
                 (fail) => { send401(response, fail); });
    }
});

// Respond to an API request
app.get("/", (request, response) => {
    response.send({message: "Hello friend"});
});

// Utility function to send a 401 response
function send401 (response, err) {
    response.status(401).send({
        error: "Not authenticated",
        idp: "/* Cognito auth URL goes here */",
        detail: err.message
    });
}

validate(token, console.info);