/* Contains functions related to the user logging in and out, and 
   checking if the user is logged in, etc.
*/

define("userstate",

    [],

    function () {

        var setCookie = function() {

        };

        window.logUserIn = function (googleUser) {
            console.log("logged in!");
            // Useful data for your client-side scripts:
            var profile = googleUser.getBasicProfile();
            console.log("ID: " + profile.getId()); // Don't send this directly to your server!
            console.log('Full Name: ' + profile.getName());
            console.log('Given Name: ' + profile.getGivenName());
            console.log('Family Name: ' + profile.getFamilyName());
            console.log("Image URL: " + profile.getImageUrl());
            console.log("Email: " + profile.getEmail());

            // The ID token you need to pass to your backend:
            var id_token = googleUser.getAuthResponse().id_token;
            console.log("ID Token: " + id_token);

            // TODO: add cookie stuff

            console.log(window.location);
            window.location.href = "dashboard.html";
        };

        window.logUserOut = function() {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        };

        var isUserLoggedIn = function() {
            // TODO
        };

        var testUserLoggedInTrue = function() {
            return true;
        };

        var testUserLoggedInFalse = function() {
            return true;
        };

        return {
            logUserOut: logUserOut,
            isUserLoggedIn: isUserLoggedIn,
            testUserLoggedInTrue: testUserLoggedInTrue,
            testUserLoggedInFalse: testUserLoggedInFalse
        }
    }
);