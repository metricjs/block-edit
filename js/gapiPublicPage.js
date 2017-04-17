function btnHandlers() {
    var signinBtn = document.getElementById('signin-btn');
    signinBtn.onclick = handleSigninBtn;
}

function handleSigninBtn(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function requiresRedirect(isSignedIn) {
    if (window.location.pathname === "/infs3202-project/about.html") {
        return false;
    }
    return isSignedIn;
}