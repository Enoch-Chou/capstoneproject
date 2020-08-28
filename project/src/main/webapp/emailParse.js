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

/** Class to load ML Model and find the best answer using email bodies. */
class MLModelEmailParse {
    constructor() {
        this.model = qna.load();
    }

    /** Parse Email Bodies to apply ML Model using Promises */
    parseEmailsWithModel(gmail) {
        // class from Gmail API js file
        const { question, emailObjects } = gmail;
        const allPass = this.extractEmailBodiesToArray(emailObjects);
        console.time("Using Promises Test");
        this.model.then(model => {
            const promises = allPass.map(
                passage => model.findAnswers(question, passage),
            );
            Promise.all(promises).then(values => {
                const nonEmpty = this.getScoreToEmail(values, allPass, emailObjects);
                const answer = document.getElementById("answer");
                answer.innerHTML = '';
                if (nonEmpty.size == 0) {
                    document.getElementById("emailAnswers").innerHTML = "";
                    answer.innerHTML = "No Answer Available";
                }
                else {
                    this.displayEmailBodies(nonEmpty, answer);
                    console.timeEnd("Using Promises Test");
                    initMap();
                }
            });
        });
    }

    displayEmailBodies(nonEmpty, answer) {
        document.getElementById("emailAnswers").innerHTML = "";
        const arrayConfidence = this.getArrayOfConfidence(nonEmpty);
        for (let emailIndex = 0; emailIndex < arrayConfidence.length; emailIndex++) {
            const mlDictAnswer = nonEmpty.get(arrayConfidence[emailIndex]);
            answer.innerHTML = mlDictAnswer["answer"];
            answer.value = mlDictAnswer["answer"];
            const answerText = mlDictAnswer["answer"];
            this.createEmailButton(answerText);
            this.createDivEmailTag(mlDictAnswer, emailIndex);
            this.addDivEmailDetails(mlDictAnswer, emailIndex, answerText);
            // Display top 3 emails.
            if (emailIndex == 3) {
                break;
            }
        }
        this.allowCollapse();
    }

    addDivEmailDetails(mlDictAnswer, emailIndex, answerText) {
        const emailBodyText = mlDictAnswer["emailBody"];
        const dateText = mlDictAnswer["emailDate"];
        document.getElementById(`emailSubject${emailIndex}`).innerHTML = `${"Subject:".bold().fontsize(4)} ${mlDictAnswer["emailSubject"]}`;
        document.getElementById(`emailSender${emailIndex}`).innerHTML = `${"Sender:".bold().fontsize(4)} ${mlDictAnswer["emailSender"]}`;
        document.getElementById(`emailDate${emailIndex}`).innerHTML = `${"Date:".bold().fontsize(4)}${dateText.slice(5)}`; // Removes "Date:" from original object.
        this.highlightAnswer(emailBodyText.slice(2), answerText, document.getElementById("emailBody" + emailIndex));
    }

    createDivEmailTag(mlDictAnswer, emailIndex) {
        let arrayTitleProperties = ["emailSubject", "emailSender", "emailDate", "emailBody"];
        let pTagString = "";
        for (let propertyIndex = 0; propertyIndex < arrayTitleProperties.length; propertyIndex++) {
            const tagNumber = `${arrayTitleProperties[propertyIndex]}${emailIndex}`;
            // Use pre tag to preserve spaces and line breaks instead of p tag. 
            pTagString += `<pre id='${tagNumber}'></pre>`;
        }
        let emailBodyDiv = document.createElement("div");
        emailBodyDiv.setAttribute("class", "content")
        emailBodyDiv.innerHTML = pTagString;
        document.getElementById("emailAnswers").appendChild(emailBodyDiv);
    }

    createEmailButton(answerText) {
        let btnEmail = document.createElement("BUTTON");
        btnEmail.setAttribute("class", "collapsible");
        btnEmail.innerHTML = answerText;
        document.getElementById("emailAnswers").appendChild(btnEmail);
    }

    extractEmailBodiesToArray(emailDict) {
        const allPass = [];
        for (let key in emailDict) {
            let body = emailDict[key]["emailBody"];
            allPass.push(body);
        }
        return allPass;
    }

    getEmailProps(emailObjects, emailBodyValue) {
        const emailProps = [];
        for (let key in emailObjects) {
            let body = emailObjects[key]["emailBody"];
            if (body == emailBodyValue) {
                emailProps.push(emailObjects[key]["emailDate"]);
                emailProps.push(emailObjects[key]["emailSubject"]);
                emailProps.push(emailObjects[key]["emailSender"]);
            }
        }
        return emailProps;
    }

    /** Create map of scores with values as ML answer and email properties. */
    getScoreToEmail(mlValues, allPass, emailObjects) {
        const confidenceWithEmailBody = new Map();
        for (let i = 0; i < mlValues.length; i++) {
            if (mlValues[i].length != 0) {
                let mlAnswer = mlValues[i][0]["text"];
                let arrayEmailProperties = this.getEmailProps(emailObjects, allPass[i]);
                confidenceWithEmailBody.set(mlValues[i][0]["score"], {
                    "answer": mlAnswer,
                    "emailBody": allPass[i],
                    "emailDate": arrayEmailProperties[0],
                    "emailSubject": arrayEmailProperties[1],
                    "emailSender": arrayEmailProperties[2],
                });
            }
        }
        return confidenceWithEmailBody;
    }

    getArrayOfConfidence(answerDict) {
        let confidenceArray = [];
        for (let key of answerDict.keys()) {
            confidenceArray.push(key);
        }
        let orderedArray = confidenceArray.sort((a, b) => b - a);
        return orderedArray;
    }

    highlightAnswer(emailBody, answer, bodyTag) {
        bodyTag.innerHTML = emailBody;
        let innerHTML = bodyTag.innerHTML;
        let index = innerHTML.indexOf(answer);
        if (index >= 0) {
            const bodyLabel = "Body: ".bold().fontsize(4);
            const highlightedText = `<span class='highlight'>${innerHTML.substring(index, index + answer.length)}</span>`;
            innerHTML = `${bodyLabel} ${innerHTML.substring(0, index)}${highlightedText}${innerHTML.substring(index + answer.length)}`;
            let emailWithoutHashCode = this.removeHashCode(innerHTML);
            // Use regular expression to remove empty lines and tabs in body of email.
            bodyTag.innerHTML = emailWithoutHashCode.replace(/(^[ \t]*\n)/gm, "");
        }
    }

    removeHashCode(innerHTML) {
        let noHash = innerHTML;
        const hashedStartIndex = innerHTML.indexOf("--00");
        if (hashedStartIndex >= 0) {
            noHash = innerHTML.substring(0, hashedStartIndex);
        }
        return noHash;
    }

    allowCollapse() {
        let collapseTag = document.getElementsByClassName("collapsible");
        for (let i = 0; i < collapseTag.length; i++) {
            collapseTag[i].addEventListener("click", function() {
                this.classList.toggle("active");
                let content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        }
    }
}


// test for Jasmine
module.exports = {
    getScoreToEmail: MLModelEmailParse.getScoreToEmail,
    extractEmailBodiesToArray: MLModelEmailParse.extractEmailBodiesToArray,
    highestConfidence: MLModelEmailParse.highestConfidence,
    MLModelEmailParse: MLModelEmailParse
};
