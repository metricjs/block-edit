function btnHandlers() {
    var signoutBtn = document.getElementById('signout-btn');
    signoutBtn.onclick = handleSignoutBtn;
}

function handleSignoutBtn(event) {
    gapi.auth2.getAuthInstance().signOut();
}

function requiresRedirect(isSignedIn) {
    return !isSignedIn;
}
