// Client ID and API key from the Developer Console
var CLIENT_ID = '473871398068-vvdtt4ltb7p5poc1nnn6hgb8hhb92ufv.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'profile https://www.googleapis.com/auth/drive.appdata';

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Add handlers for sign in and out buttons
        // signinBtn.onclick = handleSigninBtn;
        // signoutBtn.onclick = handleSignoutBtn;
        btnHandlers();

        // Check user is signed or or not as appropriate for the page
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

function updateSigninStatus(isSignedIn) {
    if (requiresRedirect(isSignedIn)) {
        if (isSignedIn) {
            window.location = "/infs3202-project/dashboard.html";
        } else {
            window.location = "/infs3202-project/index.html";
        }
    } else {
        initPageCode();
    }
}

function checkSigninStatus() {
    return gapi.auth2.getAuthInstance().isSignedIn.get();
}

function getUser() {
    var user = {};

    var userInstance = gapi.auth2.getAuthInstance().currentUser.get();
    user.token = userInstance.getAuthResponse().id_token;
    user.id = userInstance.getId();

    var profile = userInstance.getBasicProfile();
    user.name = profile.getName();
    user.email = profile.getEmail();

    return user;
}

/**
 * Create file:
 * method path = POST /upload/drive/v3/files
 * has 'name' metadata field
 *
 * Update file:
 * method path = PATCH /upload/drive/v3/files/fileId
 * no 'name'
 *
 * fileRef is therefore either 'name' or 'fileId' depending on the method
 */
var buildRequest = function(method, data, fileRef) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var contentType = "text/html";

    var metadata = {
        'mimeType': contentType,
    };

    if (method === "POST") {
        metadata['name'] = fileRef;
        metadata['parents'] = ["appDataFolder"];
    }

    var multipartRequestBody =
        delimiter +  'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
        data +
        close_delim;

    var path = method === "POST" ? '/upload/drive/v3/files' : '/upload/drive/v3/files/' + fileRef;

    var request = gapi.client.request({
        'path': path,
        'method': method,
        'params': {'uploadType': 'multipart'},
        'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    return request;
};