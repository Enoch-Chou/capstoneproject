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
/** Class to load ML Model and find the best answer using email bodies */
class mlModelEmailParse {
    constructor() {
        this.model;
    }

    loadModel() {
        let modelLoadReady = document.getElementById("modelLoad");
        modelLoadReady.innerHTML = 'Loading Model...';
        console.time("Model Load");
        qna.load().then(loadedModel => {
            this.model = loadedModel;
            console.timeEnd("Model Load");
            modelLoadReady.innerHTML = 'Model Ready';
        });
    }
    /** Parse Email Bodies to apply ML Model using Promises */
    parseEmailsWithModel() {
        //class from Gmail API js file
        const gmail = new gmailAPI();
        const question = gmail.question;
        const totalObjects = gmail.totalObjects;
        const model = this.model;
        const allPass = this.extractEmailBodiestoArray(totalObjects);
        console.time("Using Promises Test");
        const promises = allPass.map(
            passage => model.findAnswers(question, passage),
        );
        Promise.all(promises).then(values => {
            const nonEmpty = this.ridOfEmptyArrays(values, allPass);
            const answer = document.getElementById("answer");
            if (nonEmpty.size == 0) {
                answer.innerHTML = "No Answer Available";
            }
            else {
                const orderedConfidence = this.highestConfidence(nonEmpty);
                const mlDictAnswer = nonEmpty.get(orderedConfidence);
                console.log("original", values);
                console.log("nonEmpty", nonEmpty);
                console.log("highest confidence", orderedConfidence);
                answer.innerHTML = mlDictAnswer["answer"];
                console.timeEnd("Using Promises Test");
            }
        });
    }

    extractEmailBodiestoArray(exampleDict) {
        let allPass = [];
        for (let key in exampleDict) {
            let body = exampleDict[key]["emailBody"];
            allPass.push(body.slice(300));
        }
        return allPass;
    }
    /** Keep emails that returned an answer from ML model */
    ridOfEmptyArrays(mlValues, allPass) {
        const confidenceWithEmailBody = new Map();
        for (let i = 0; i < mlValues.length; i++) {
            if (mlValues[i].length != 0) {
                let mlAnswer = mlValues[i][0]["text"];
                confidenceWithEmailBody.set(mlValues[i][0]["score"], { "answer": mlAnswer, "emailBody": allPass[i] })
            }
        }
        return confidenceWithEmailBody;
    }

    highestConfidence(answerDict) {
        let confidenceArray = [];
        for (let key of answerDict.keys()) {
            confidenceArray.push(key);
        }
        let bestAnswer = confidenceArray.sort((a, b) => b - a);
        return bestAnswer[0];
    }
}

let mlClass = new mlModelEmailParse();


//test for Jasmine
module.exports = {
    nonEmptyArray: nonEmptyArray,
    highestConfidence: highestConfidence
};