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
var model;
function getModel()
{
    console.time("Model Load");
    qna.load().then(loadedModel => {
        model = loadedModel;
        console.timeEnd("Model Load");
    });
}

function parseEmailsWithModel()
{
    var question = "When is my Microsoft Interview?"
    var exampleDict = {
        "12345":{"date": "Some string", "body": "Your Microsoft interview will be held on October 2, 2019 at 01:45 PM Pacific Time (US & Canada)"},
        "23456":{"date": "Some string", "body": "Arely Miranda González, a Product Manager at YouTube, started Karma Action, a new non-profit organization and webapp"},
        "34567":{"date": "Some string", "body": "Your microsoft workshop is on Monday 4, 2019."},
    };
    var allPass = listOfPassages(exampleDict);
    console.time("Using Promises Test");
    const promises =allPass.map(
        passage => model.findAnswers(question, passage),
    );
    Promise.all(promises).then((values) => {
        var nonEmpty = ridOfEmptyArrays(values,allPass);
        var orderedConfidence = highestConfidence(nonEmpty);
        var MLDictAnswer = nonEmpty.get(orderedConfidence);
        console.log("original",values);
        console.log("nonEmpty", nonEmpty);
        console.log("highest confidence", orderedConfidence);
        console.log("final answer: ", MLDictAnswer["answer"]);
        console.timeEnd("Using Promises Test");
    });   
}

function listOfPassages(exampleDict)
{
    var allPass = [];
    for (var key in exampleDict)
    {
        allPass.push(exampleDict[key]["body"]);
    }
    return allPass;
}

function ridOfEmptyArrays(MLvalues,allPass)
{
    let confidenceWithEmailBody = new Map();
    for (let i = 0; i < MLvalues.length; i ++)
    {
        if (MLvalues[i].length != 0)
        {
            MLAnswer = MLvalues[i][0]["text"];
            confidenceWithEmailBody.set(MLvalues[i][0]["score"],{"answer":MLAnswer,"emailBody":allPass[i]})
        }
    }
    return confidenceWithEmailBody;
}

function highestConfidence(answerDict)
{
    var confidenceArray = [];
    for (let key of answerDict.keys())
    {
        confidenceArray.push(key);
    }
    bestAnswer = confidenceArray.sort(function(a, b){return b - a})
    return bestAnswer[0];
}

//test for Jasmine
module.exports = {
   nonEmptyArray: nonEmptyArray,
   highestConfidence: highestConfidence
};