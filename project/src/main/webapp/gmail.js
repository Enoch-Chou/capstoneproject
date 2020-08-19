// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

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
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function(error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

/**
  *  Called when the signed in status changes, to update the UI
  *  appropriately. After a sign-in, the API is called.
  */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

/**
  *  Sign in the user upon button click.
  */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
  *  Sign out the user upon button click.
  */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
  * Append a pre element to the body containing the given message
  * as its text node. Used to display the results of the API call.
  *
  * @param {string} message Text to be placed in pre element.
  */
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function getQuery() {
    const query = document.getElementById("text-input").value;
    console.log("This is the textarea: " + query);
    return query;
}


/**
 * Get Message with given ID.
 *
 * @param  {String} messageId ID of Message to get.
 */
function getMessage(messageId) {
    const messageRequest = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': messageId,
        'format': "raw"
    });
    messageRequest.execute(response => {
        //Convert from base64 encoding to text.
        const decodedEmail = atob(response.raw.replace(/-/g, '+').replace(/_/g, '/'));
        var hasFormatFlowed = false;
        const emailBodyStartIndex = decodedEmail.indexOf("Content-Type: text/plain; charset=\"UTF-8\"");
        const emailBodyEndIndex = (decodedEmail.substring(emailBodyStartIndex)).indexOf("Content-Type: text/html; charset=\"UTF-8\"")
        var emailBodyValue = decodedEmail.substring(emailBodyStartIndex, emailBodyStartIndex + emailBodyEndIndex);
        if (emailBodyValue.indexOf("format=flowed") != -1) {
            hasFormatFlowed = true;
        }
        emailBodyValue = emailBodyValue.substring(200);
        const emailDateStartIndex = decodedEmail.indexOf("Date:");
        const emailDateEndIndex = decodedEmail.substring(emailDateStartIndex).indexOf("Message-ID");
        var emailDateValue = decodedEmail.substring(emailDateStartIndex, emailDateStartIndex + emailDateEndIndex);
        const MessageIDStartIndex = decodedEmail.indexOf("Message-ID:") + 12;
        const MessageIDEndIndex = decodedEmail.substring(MessageIDStartIndex).indexOf("Subject:") + MessageIDStartIndex;
        var messageID = decodedEmail.substring(MessageIDStartIndex, MessageIDEndIndex);

        //Grabs the date of the email.
        if (emailDateValue.indexOf("X-Notifications") != -1) {
            emailDateValue = emailDateValue.substring(0, emailDateValue.indexOf("X-Notifications"));
        }

        //A condition to check if it's an actual email.
        if (!hasFormatFlowed && emailDateValue.length > 1 && emailBodyValue.indexOf("Daily Insider") == -1 /*(!(messageID in emailObject))*/) {
            emailObject[messageID] = { emailDate: emailDateValue, emailBody: emailBodyValue };
        }
    });
}

const emailObject = {};
//Retrieve messages using hardcoded queries and the signed-in email.
function listMessages() {
    var getPageOfMessages = function(request, result) {
        request.execute(function(resp) {
            result = result.concat(resp.messages);
            var nextPageToken = resp.nextPageToken;
            if (nextPageToken) {
                request = gapi.client.gmail.users.messages.list({
                    'userId': 'me',
                    'pageToken': nextPageToken,
                    'q': getQuery()
                });
                getPageOfMessages(request, result);
            } else {
                for (i = 0; i < result.length; i++) {
                    getMessage(result[i].id);
                }
            }
        });
    };
    var initialRequest = gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'q': getQuery()
    });
    getPageOfMessages(initialRequest, []);
}

function getEmailObject() {
    console.log(emailObject);
}