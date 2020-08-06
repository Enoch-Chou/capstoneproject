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

class modelStatus {
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
        Promise.all(promises).then((values) => {
            const nonEmpty = this.ridOfEmptyArrays(values, allPass);
            if (nonEmpty.size == 0) {
                console.log("No Answer Available");
            }
            else {
                const orderedConfidence = this.highestConfidence(nonEmpty);
                const MLDictAnswer = nonEmpty.get(orderedConfidence);
                console.log("original", values);
                console.log("nonEmpty", nonEmpty);
                console.log("highest confidence", orderedConfidence);
                console.log("final answer: ", MLDictAnswer["answer"]);
                const answer = document.getElementById("answer");
                answer.innerHTML = MLDictAnswer["answer"];
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

    ridOfEmptyArrays(MLvalues, allPass) {
        let confidenceWithEmailBody = new Map();
        for (let i = 0; i < MLvalues.length; i++) {
            if (MLvalues[i].length != 0) {
                let MLAnswer = MLvalues[i][0]["text"];
                confidenceWithEmailBody.set(MLvalues[i][0]["score"], { "answer": MLAnswer, "emailBody": allPass[i] })
            }
        }
        return confidenceWithEmailBody;
    }

    highestConfidence(answerDict) {
        let confidenceArray = [];
        for (let key of answerDict.keys()) {
            confidenceArray.push(key);
        }
        let bestAnswer = confidenceArray.sort(function(a, b) { return b - a })
        return bestAnswer[0];
    }
}

let modelClass = new modelStatus();


//test for Jasmine
module.exports = {
    nonEmptyArray: nonEmptyArray,
    highestConfidence: highestConfidence
};