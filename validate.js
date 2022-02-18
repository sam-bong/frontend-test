// Libraries we need
const axios = require("axios");
const jwkToPem = require("jwk-to-pem");
const jwt = require("jsonwebtoken");

// User pool information
const region = "ap-southeast-2";
const poolId = "633ikse8kathsec9ksc6m1qpqr";
const issuer = "https://cognito-idp." + region + ".amazonaws.com/" + poolId;

// When verifying, we expect to use RS256, and that our issuer is correct
const verificationOptions = {
    algorithms: ["RS256"],
    issuer
};

// Get our token
const token = "eyJraWQiOiJVdVR5YVhaY2JCN0IzcEt1TE1oMlNoNmxaemlTaUE4XC96R0pQNDFsdnJWcz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3OWVlODE1ZS0yMTdlLTQwZDMtODk3Yy0yYTRmMjUzYzExNTciLCJldmVudF9pZCI6IjhkYzA4ZjNlLTI4YmUtNDBmOC1hMDRkLTk4ZmYyNWNiZDE2NCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2NDUxNDQzNzUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMi5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMl80dVpNekNUZ3YiLCJleHAiOjE2NDUxNDc5NzUsImlhdCI6MTY0NTE0NDM3NSwidmVyc2lvbiI6MiwianRpIjoiOGI2NDc2MmMtOTE2OS00MzMyLWE0YjktNTBjN2M4NWY3ZDViIiwiY2xpZW50X2lkIjoiNjMzaWtzZThrYXRoc2VjOWtzYzZtMXFwcXIiLCJ1c2VybmFtZSI6InNhbS5ib25nQGFsZXhzb2x1dGlvbnMuY29tLmF1In0.CJnHf3J68qJ4tkxjSbhVW0u5KeUNalwX4OQb3NQDxhAmcqFARk_94JfUvUt642MPXBOh-2aooQ4_m1vbHRx4GnbIF-H-PhxuPfFB-gjRz24RcS1rVY8QTt8fkbd-dmzzy1x56FU8Rl-IYMUq2RSo-s_cwOA-0KcJAgDyh6gs5DFbHzKru702s5Lsu6kBTetI_EiZcRqnHgLv-cWzZf1_3pd8O7snbJWKF8ZaFyNZP9q4JI_nREjtR4yUL-dTWxZYV7VDRe2UtdOG79ON__-2WlNkNLERsrCLvetVipMM3WVaC_XvGa32jhmIU8638QoFY1j9rtICcPG0TpdKhRJEAw&expires_in=3600&token_type=Bearer";

// Get our keys
function getKeys(region, poolId) {
    let jwksUrl = issuer + "/.well-known/jwks.json";
    return axios.get(jwksUrl).then(response => Promise.resolve(response.data.keys));
}

// Index keys by "kid", and convert to PEM
function indexKeys(keyList) {
    let result = keyList.reduce((keys, jwk) => {
        keys[jwk.kid] = jwkToPem(jwk);
        return keys;
    }, {});
    return Promise.resolve(result);
}

// Now we need to decode our token, to find the verification key
function findVerificationKey(token) {
    return (pemList) => {
        let decoded = jwt.decode(token, {complete: true});
        return Promise.resolve(pemList[decoded.header.kid]);
    };
}

// Verify our token
function verifyToken(token) {
    return (pem) => {
        let verified = jwt.verify(token, pem, verificationOptions);
        return Promise.resolve(verified);
    };
}

// Check that we are using the token to establish access
function checkTokenUse(verifiedToken) {
    if (verifiedToken.token_use === "access") {
        return Promise.resolve(verifiedToken);
    }
    throw new Error("Expected access token, got: " + verifiedToken.token_use);
}

// The validation process
function validate(token, doSomething) {
    getKeys(region, poolId)
        .then(indexKeys)
        .then(findVerificationKey(token))
        .then(verifyToken(token))
        .then(checkTokenUse)
        .then(doSomething)
        .catch(handleError);
}

const doSomething = console.info;

// Error handling
function handleError(err) {
    console.error(err);
}