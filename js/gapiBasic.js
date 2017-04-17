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