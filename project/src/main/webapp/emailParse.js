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
    var question = document.getElementById('query').value;
    console.log(document.getElementById('query').value);
    var exampleDict = {
        "23456":{"date": "Some string", "body": "String"},
        "34567":{"date": "Some string", "body": "String"},
        "54321":{"date": "Some string", "body": "String"}
    };
    var allPass = listOfPassages(exampleDict);
    console.time("Using Promises Test");
    const promises = allPass.map(
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
        document.getElementById('displayAnswer').innerHTML = MLDictAnswer["answer"];
        document.getElementById('displayAnswer').value = MLDictAnswer["answer"];
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