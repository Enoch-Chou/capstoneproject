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

class GmailAuthorization {
    // Array of API discovery doc URLs for APIs used by the quickstart
    DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

    authorizeButton = document.getElementById('authorize_button');
    signoutButton = document.getElementById('signout_button');
    currAccountContainer = document.getElementById("account-container");

    handleClientLoad() {
        gapi.load('client:auth2', () => this.initClient()); //use an arrow function to keep scope of this
    }

    initClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: this.DISCOVERY_DOCS,
            scope: this.SCOPES
        }).then(() => {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => this.updateSigninStatus(isSignedIn));

            //Handle the initial sign-in state
            this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        }, function(error) {
            appendPre(JSON.stringify(error, null, 2));
        });
    }

    updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            this.currAccountContainer.innerHTML = gapi.auth2.getAuthInstance().currentUser.get().rt.$t;
            this.authorizeButton.style.display = 'none';
            this.signoutButton.style.display = 'block';
        } else {
            this.authorizeButton.style.display = 'block';
            this.signoutButton.style.display = 'none'
        }
    }

    handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    appendPre(message) {
        let pre = document.getElementById('content');
        let textContent = document.createTextNode(message + '\n');
        pre.appendChild(textContent);
    }
}