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

<<<<<<< HEAD
class GmailAPI {
    constructor() {
        this.emailObjects = {};
    }

    getQuery() {
        this.question = document.getElementById("text-input").value;
    }

    getEmailBody(decodedEmail) {
        const emailBodyStartIndex = decodedEmail.indexOf("Content-Type: text/plain; charset=\"UTF-8\"");
        const emailBodyEndIndex = (decodedEmail.substring(emailBodyStartIndex)).indexOf("Content-Type: text/html; charset=\"UTF-8\"")
        let emailBodyValue = decodedEmail.substring(emailBodyStartIndex, emailBodyStartIndex + emailBodyEndIndex);
        if (emailBodyValue.indexOf("Forwarded message") != -1) {
            emailBodyValue = emailBodyValue.substring(0, emailBodyValue.indexOf("Forwarded message"));
        }
        const quotedPrintableIndex = emailBodyValue.indexOf("quoted-printable");
        const quotedPrintableLength = "quoted-printable".length;
        if (quotedPrintableIndex != -1) {
            emailBodyValue = emailBodyValue.substring(quotedPrintableIndex + quotedPrintableLength);
        }
        const contentTypeIndex = emailBodyValue.indexOf("Content-Type: text/plain; charset=\"UTF-8");
        const contentTypeLength = "Content-Type: text/plain; charset=\"UTF-8".length;
        if (contentTypeIndex != -1) {
            emailBodyValue = emailBodyValue.substring(contentTypeIndex + contentTypeLength);
        }
        return emailBodyValue;
    }

    getEmailDate(decodedEmail) {
        const emailDateStartIndex = decodedEmail.indexOf("Date:");
        const emailDateEndIndex = decodedEmail.substring(emailDateStartIndex).indexOf("Message-ID");
        return decodedEmail.substring(emailDateStartIndex, emailDateStartIndex + emailDateEndIndex);
    }

    getMessageID(decodedEmail) {
        const MessageIDStartIndex = decodedEmail.indexOf("Message-ID:") + 12;
        const MessageIDEndIndex = decodedEmail.substring(MessageIDStartIndex).indexOf("Subject:") + MessageIDStartIndex;
        let emailDateValue = decodedEmail.substring(MessageIDStartIndex, MessageIDEndIndex);
        if (emailDateValue.indexOf("X-Notifications") != -1) {
            emailDateValue = emailDateValue.substring(0, emailDateValue.indexOf("X-Notifications"));
        }
        return emailDateValue;
    }

    getEmailSubject(decodedEmail) {
        const subjectLength = "Subject: ".length;
        const emailSubjectStartIndex = decodedEmail.indexOf("Subject: ") + subjectLength;
        const emailSubjectEndIndex = decodedEmail.substring(emailSubjectStartIndex).indexOf("To: ") + emailSubjectStartIndex;
        const emailSubjectValue = decodedEmail.substring(emailSubjectStartIndex, emailSubjectEndIndex);
        return emailSubjectValue;
    }

    getEmailSender(decodedEmail) {
        const fromLength = "From: ".length;
        const emailSenderStartIndex = decodedEmail.indexOf("From: ") + fromLength;
        const emailSenderEndIndex = decodedEmail.substring(emailSenderStartIndex).indexOf("Date:") + emailSenderStartIndex;
        const emailSenderValue = decodedEmail.substring(emailSenderStartIndex, emailSenderEndIndex);
        return emailSenderValue;
    }

    hasEmails(emailList) {
        if (emailList[0] !== undefined) {
            return true;
        }
        return false;
    }

    /**
      * Checks if the email is a valid email
      * 
      * Criteria 1: Isn't a Daily Insider message - breaks ML model
      * Criteria 2: Isn't an empty email
      * Criteria 3: Isn't a google chat message
      */
    isActualEmail(emailBodyValue, emailDateValue) {
        if (emailBodyValue.indexOf("Daily Insider") != -1) {
            return false;
        }
        if (emailDateValue.length <= 1) {
            return false;
        }
        if (emailBodyValue.indexOf("format=flowed") != -1) {
            return false;
        }
        return true;
    }

    /**
     * Get Message with given ID.
     *
     * @param  {String} messageId ID of Message to get.
     */
    getMessage(messageId) {
        const getMessagePromise = new Promise((resolve) => {
            const messageRequest = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': messageId,
                'format': "raw"
            });
            messageRequest.execute(response => {
                //Convert from base64 encoding to text.
                const decodedEmail = atob(response.raw.replace(/-/g, '+').replace(/_/g, '/'));
                const emailBodyValue = this.getEmailBody(decodedEmail);
                const emailDateValue = this.getEmailDate(decodedEmail);
                const messageID = this.getMessageID(decodedEmail);
                const emailSenderValue = this.getEmailSender(decodedEmail);
                const emailSubjectValue = this.getEmailSubject(decodedEmail);
                if (this.isActualEmail(emailBodyValue, emailDateValue)) {
                    this.emailObjects[messageID] = {
                        emailDate: emailDateValue,
                        emailBody: emailBodyValue,
                        emailSender: emailSenderValue,
                        emailSubject: emailSubjectValue
                    };
                }
                resolve();
            });
        });
        return getMessagePromise;
    }

    //Retrieve messages using hardcoded queries and the signed-in email.
    listMessages() {
        this.emailObjects = {};
        const listMessagePromise = new Promise((resolve) => {
            const promiseArray = [];
            let getPageOfMessages = (request, result) => {
                request.execute(resp => {
                    result = result.concat(resp.messages);
                    var nextPageToken = resp.nextPageToken;
                    if (nextPageToken) {
                        request = gapi.client.gmail.users.messages.list({
                            'userId': 'me',
                            'pageToken': nextPageToken,
                            'q': this.question
                        });
                        getPageOfMessages(request, result);
                    } else {
                        for (var i = 0; i < result.length; i++) {
                            if (this.hasEmails(result)) {
                                promiseArray.push(this.getMessage(result[i].id));
                            }
                        }
                        Promise.all(promiseArray).then(() => resolve()
                        );
                    }
                });
            };
            var initialRequest = gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'q': this.question
            });
            getPageOfMessages(initialRequest, []);
            return Promise.all(promiseArray);
        });
        return listMessagePromise;
    }
=======
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


    async function keywordExtraction(userInput) {
    var result = "";
    var count = 0;
    var searchQuery = userInput.split(" ");
    for (word of searchQuery){
        if ((searchQuery.length-1) == count && word.indexOf('?') != -1) {
                word = word.substring(0, word.length-1);
            }
        var url = new URL("https://api.datamuse.com/words?md=p&sp=" + word + "&max=1");
        const output = await fetch(url).then(response => response.text());
        if (output.includes("[\"n\"]") == true || output.includes("[\"adj\"]") == true){
            result += word;
            if (count != (searchQuery.length-1)){
                result += " ";
            }
        }
        count++;
    }
    return result; 
    }
    
    //Retrieve messages using hardcoded queries and the signed-in email.
    async function listMessages() {
        const t0 = performance.now();
        var list = [];
        var getPageOfMessages = function(request, result) {
            request.execute(function(resp) {
                result = result.concat(resp.messages);
                var nextPageToken = resp.nextPageToken;
                if (nextPageToken) {
                    request = gapi.client.gmail.users.messages.list({
                    'userId': 'me',
                    'pageToken': nextPageToken,
                    'q': "When is the Interview Prep Workshop?"
                });
                getPageOfMessages(request, result);
                } else {
                    for (i = 0; i < result.length; i++) {
                        const messageRequest = gapi.client.gmail.users.messages.get({
                            'userId': 'me',
                            'id': result[i].id,
                            'format': "raw"
                        });
                        var messageID = result[i].id;
                        messageRequest.execute(response => {
                            const decodedEmail = atob(response.raw.replace(/-/g, '+').replace(/_/g, '/')); 
                            const emailBodyStartIndex = decodedEmail.indexOf("Content-Type: text/plain; charset=\"UTF-8\"");
                            const emailBodyEndIndex = (decodedEmail.substring(emailBodyStartIndex)).indexOf("Content-Type: text/html; charset=\"UTF-8\"")
                            const emailBodyValue = decodedEmail.substring(emailBodyStartIndex, emailBodyStartIndex+emailBodyEndIndex);
                            const emailDateStartIndex = decodedEmail.indexOf("Date:");
                            const emailDateEndIndex = decodedEmail.substring(emailDateStartIndex).indexOf("Message-ID");
                            var emailDateValue = decodedEmail.substring(emailDateStartIndex, emailDateStartIndex+emailDateEndIndex);
                            if (emailDateValue.indexOf("X-Notifications") != -1) {
                                emailDateValue = emailDateValue.substring(0, emailDateValue.indexOf("X-Notifications"));
                            }
                            var emailObject = {};
                            emailObject[messageID] = {emailDate: emailDateValue, emailBody: emailBodyValue}; 
                            if (emailBodyValue.indexOf("format=flowed") == -1 && emailDateValue.length > 1) {
                                list[list.length] = emailObject;
                            }
                        });
                    }
                    }
                });
            };
            console.log(list);
            var initialRequest = gapi.client.gmail.users.messages.list({
            'userId': 'me',
            'q': "When is the interview prep workshop?"
        });
        getPageOfMessages(initialRequest, []);
        const t1 = performance.now();
        console.log(t1-t0);
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
>>>>>>> d511430ba90337c1942625d67dde8f1e14a2c247

    //Retrieve messages using hardcoded queries and the signed-in email.
    listMessagesWithExtraction() {
        this.emailObjects = {};
        console.log("Current Question:", this.question);
        // keywordExtraction(this.question).then(value => {});
        const listMessagePromise = new Promise((resolve) => {
            keywordExtraction(this.question).then(value => {
                const promiseArray = [];
                var getPageOfMessages = (request, result) => {
                    request.execute(resp => {
                        result = result.concat(resp.messages);
                        var nextPageToken = resp.nextPageToken;
                        if (nextPageToken) {
                            request = gapi.client.gmail.users.messages.list({
                                'userId': 'me',
                                'pageToken': nextPageToken,
                                'q': value
                            });
                            getPageOfMessages(request, result);
                        } else {
                            for (var i = 0; i < result.length; i++) {
                                if (this.hasEmails(result)) {
                                    promiseArray.push(this.getMessage(result[i].id));
                                }
                                else {

                                }
                            }
                            Promise.all(promiseArray).then(() => resolve()
                            );
                        }
                    });
                };
                var initialRequest = gapi.client.gmail.users.messages.list({
                    'userId': 'me',
                    'q': value
                });
                getPageOfMessages(initialRequest, []);
            });
        });
        return listMessagePromise;
    }
};
