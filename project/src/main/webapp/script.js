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

/**
 * Adds a random greeting to the page.
 */
function addRandomGreeting() {
    const greetings =
        ['Hello world!', '¡Hola Mundo!', '你好，世界！', 'Bonjour le monde!'];

    // Pick a random greeting.
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Add it to the page.
    const greetingContainer = document.getElementById('greeting-container');
    greetingContainer.innerText = greeting;
}

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
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        },  function(error) {
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
            // getMessage();
            listMessages();
        }   else {
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

    /**
      * Print all Labels in the authorized user's inbox. If no labels
      * are found an appropriate message is printed.
      */
    // function listLabels() {
    //     const t0 = performance.now();
    //     gapi.client.gmail.users.labels.list({
    //       'userId': 'me'
    //     }).then(function(response) {
    //         var labels = response.result.labels;
    //         appendPre('Labels:');

    //         if (labels && labels.length > 0) {
    //             for (i = 0; i < labels.length; i++) {
    //             var label = labels[i];
    //             appendPre(label.name);
    //             console.log(label.name);
    //             }
    //         } else {
    //             appendPre('No Labels found.');
    //         }
    //     const t1 = performance.now();
    //     console.log(t1-t0);
    //     });
    // }

    // function listMessages() {
    //     const t0 = performance.now();
    //     gapi.client.gmail.users.messages.list({
    //       'userId': 'me'
    //     }).then(function(response) {
    //         var messages = response.result.messages;
    //         //appendPre('Messages:');

    //         if (messages && messages.length > 0) {
    //             for (i = 0; i < messages.length; i++) {
    //             var message = messages[i];
    //             //appendPre(message.name);
    //             console.log(message.name);
    //             }
    //         } else {
    //             appendPre('No Messages found.');
    //         }
    //     const t1 = performance.now();
    //     console.log(t1-t0);
    //     });
    // }

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
                    'q': 'Google Interview'
                });
                getPageOfMessages(request, result);
                } else {
                    for (i = 0; i < result.length; i++) {
                        const messageRequest = gapi.client.gmail.users.messages.get({
                            'userId': 'me',
                            'id': result[i].id,
                            'format': "full"
                        });
                        console.log(messageRequest);
                    }
                    console.log(result)
                    }
                });
            };
            var initialRequest = gapi.client.gmail.users.messages.list({
            'userId': 'me',
            'q': 'Google Interview'
        });
        getPageOfMessages(initialRequest, []);
    }

/**
 * Get Message with given ID.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} messageId ID of Message to get.
 * @param  {Function} callback Function to call when the request is complete.
 */
function getMessage(userId, messageId, callback) {
  var request = gapi.client.gmail.users.messages.get({
    'userId': userId,
    'id': messageId
  });
  request.execute(callback);
}

