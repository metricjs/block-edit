function btnHandlers() {
    var signinBtn = document.getElementById('signin-btn');
    signinBtn.onclick = handleSigninBtn;
}

function handleSigninBtn(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function requiresRedirect(isSignedIn) {
    return isSignedIn;
}