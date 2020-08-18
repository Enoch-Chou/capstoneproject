/** Class to load ML Model and find the best answer using email bodies. */
class MLModelEmailParse {
    constructor() {
        this.model = qna.load();
    }

    /** Parse Email Bodies to apply ML Model using Promises */
    parseEmailsWithModel() {
        var self = this;
        var question = document.getElementById('query').value;
        var exampleDict = {
            "messageId":{"date": "Some string", "emailBody": "String"},
            "messageId":{"date": "Some string", "emailBody": "String"},
            "messageId":{"date": "Some string", "emailBody": "String"}
        };
        const allPass = self.extractEmailBodiesToArray(exampleDict);
        console.log(allPass);
        console.time("Using Promises Test");
        this.model.then(model => {
            const promises = allPass.map(
                passage => model.findAnswers(question, passage),
            );
            Promise.all(promises).then(values => {
                var self = this;
                const nonEmpty = self.getScoreToEmail(values, allPass);
                const answer = document.getElementById("displayAnswer");
                if (nonEmpty.size == 0) {
                    answer.innerHTML = "No Answer Available";
                }
                else {
                    const orderedConfidence = self.highestConfidence(nonEmpty);
                    const mlDictAnswer = nonEmpty.get(orderedConfidence);
                    console.log("original", values);
                    console.log("nonEmpty", nonEmpty);
                    console.log("highest confidence", orderedConfidence);
                    answer.innerHTML = mlDictAnswer["answer"];
                    answer.value = mlDictAnswer["answer"];
                    initMap();
                    console.timeEnd("Using Promises Test");
                }
            });
        });
    }

    extractEmailBodiesToArray(exampleDict) {
        const allPass = [];
        for (let key in exampleDict) {
            let body = exampleDict[key]["emailBody"];
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

    highestConfidence(answerDict) {
        let confidenceArray = [];
        for (let key of answerDict.keys()) {
            confidenceArray.push(key);
        }
        let bestAnswer = confidenceArray.sort((a, b) => b - a);
        return bestAnswer[0];
    }
}

