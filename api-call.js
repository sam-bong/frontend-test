// Prettify a JSON payload
const prettify = (x) => JSON.stringify(JSON.parse(x), null, 4);

// Prepare our API call in advance
const xhr = new XMLHttpRequest();

// Set up our handler for the API call completing
xhr.onreadystatechange = function () {

    // When our state is 4, we have completed the API call
    if (this.readyState == 4) {

        // Update our status marker
        document.getElementById("status").innerHTML = "" + this.status;

        // On success, display the result
        if (this.status == 200) {
            document.getElementById("status").className = "tertiary";
            document.getElementById("result").innerText = prettify(xhr.responseText);

        // On authorization failure, redirect to authentication server
        } else if (this.status == 401) {
            if (xhr.responseText) {
                const response = JSON.parse(xhr.responseText);
                if (response.idp) {
                    window.location = response.idp;
                    return;
                }
            }

            // If we have no specifics around the failure, provide a generic message
            document.getElementById("status").className = "secondary";
            document.getElementById("result").innerHTML = "/* Not authorised for access */";

        // On failure, indicate the fail
        } else {
            document.getElementById("status").className = "secondary";
            document.getElementById("result").innerHTML = "/* Unsuccessful API call */";
        }
    }
};

// Find the access token in an array of elements
function findAccessToken(result, current) {
    if (current.substr(0, 13) === "access_token=") {
        return current.substr(13);
    }
    return result;
}

// Function to call the api
function apiCall () {
    const jwt = window.location.hash.split("&").reduce(findAccessToken);
    xhr.open("GET", window.location.origin + "/", true);
    xhr.setRequestHeader("Authorization", "bearer " + jwt);
    xhr.send();
}