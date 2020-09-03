let gmailAuth = null;

function handleClientLoad() {
    gmailAuth = new GmailAuthorization();
    gmailAuth.handleClientLoad();
}

function handleAuthClick() {
    gmailAuth.handleAuthClick();
}

function handleSignoutClick() {
    gmailAuth.handleSignoutClick();
} 