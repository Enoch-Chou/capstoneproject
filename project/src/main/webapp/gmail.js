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

    /** Checks if the query returns emails */
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

    /** Retrieve messages using hardcoded queries and the signed-in email. */
    listMessages() {
        this.emailObjects = {};
        return new Promise((resolve) => {
            const promiseArray = [];
            const getPageOfMessages = (request, result) => {
                request.execute(resp => {
                    result = result.concat(resp.messages);
                    const nextPageToken = resp.nextPageToken;
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
    }

    /**  Retrieve messages using hardcoded queries and the signed-in email. */
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
