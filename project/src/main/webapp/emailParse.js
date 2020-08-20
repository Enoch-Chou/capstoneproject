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
        const allPass = this.extractEmailBodiesToArray(emailobjects);
        console.time("Using Promises Test");
        this.model.then(model => {
            const promises = allPass.map(
                passage => model.findAnswers(question, passage),
            );
            Promise.all(promises).then(values => {
                const nonEmpty = this.getScoreToEmail(values, allPass);
                const answer = document.getElementById("answer");
                const displayEmail = document.getElementById("display_emails");
                displayEmail.innerHTML = '';
                answer.innerHTML = '';
                if (nonEmpty.size == 0) {
                    answer.innerHTML = "No Answer Available";
                }
                else {
                    this.displayEmailBodies(nonEmpty, answer, displayEmail);
                    console.timeEnd("Using Promises Test");
                }
            });
        });
    }

    displayEmailBodies(nonEmpty, answer, displayEmail) {
        const arrayConfidence = this.arrayOfConfidence(nonEmpty);
        for (let i = 0; i < 3; i++) {
            const mlDictAnswer = nonEmpty.get(arrayConfidence[i]);
            displayEmail.appendChild(this.createListElement("", mlDictAnswer["answer"]));
            displayEmail.appendChild(this.createListElement(mlDictAnswer["emailBody"], mlDictAnswer["answer"]));
        }

    }

    extractEmailBodiesToArray(emailDict) {
        const allPass = [];
        for (let key in emailDict) {
            let body = emailDict[key]["emailBody"];
            allPass.push(body);
        }
        return allPass;
    }

    /** Create map of scores with values as ML answer and email body. */
    getScoreToEmail(mlValues, allPass) {
        const confidenceWithEmailBody = new Map();
        for (let i = 0; i < mlValues.length; i++) {
            if (mlValues[i].length != 0) {
                let mlAnswer = mlValues[i][0]["text"];
                confidenceWithEmailBody.set(mlValues[i][0]["score"], { "answer": mlAnswer, "emailBody": allPass[i] });
            }
        }
        return confidenceWithEmailBody;
    }

    arrayOfConfidence(answerDict) {
        let confidenceArray = [];
        for (let key of answerDict.keys()) {
            confidenceArray.push(key);
        }
        let orderedArray = confidenceArray.sort((a, b) => b - a);
        return orderedArray;
    }

    highlight(emailBody, answer, bodyTag) {
        bodyTag.innerHTML = emailBody;
        var innerHTML = bodyTag.innerHTML;
        var index = innerHTML.indexOf(answer);
        if (index >= 0) {
            innerHTML = innerHTML.substring(0, index) + "<span class='highlight'>" + innerHTML.substring(index, index + answer.length) + "</span>" + innerHTML.substring(index + answer.length);
            bodyTag.innerHTML = innerHTML;
        }
    }

    createListElement(emailBody, answer) {
        const bodyTag = document.createElement('ul');
        if (emailBody != "") {
            this.highlight(emailBody, answer, bodyTag);
        }
        else {
            bodyTag.innerHTML = answer;
        }
        return bodyTag;
    }
}

// test for Jasmine
module.exports = {
    getScoreToEmail: MLModelEmailParse.getScoreToEmail,
    extractEmailBodiesToArray: MLModelEmailParse.extractEmailBodiesToArray,
    highestConfidence: MLModelEmailParse.highestConfidence,
    MLModelEmailParse: MLModelEmailParse
};
