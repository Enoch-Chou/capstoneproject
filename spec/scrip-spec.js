/** Testing file using Jasmine on emailParse.js. */
let app= require("../project/src/main/webapp/emailParse.js");
let MLClass = app.MLModelEmailParse;

const modelClass = new MLClass();
describe("getScoreToEmail",function(){
    it("returns map with ML answer and confidence score with email body for later reference",function() {
        const currentArray = [
            [{text: "October 2, 2019", score: 6.968050003051758, startIndex: 85, endIndex: 100}],
            [],
            [{text: "October 2, 2019", score: 6.968050003051758, startIndex: 85, endIndex: 100}]
        ];
        let correctMap = new Map();
        correctMap.set(6.968050003051758, { answer: 'October 2, 2019', emailBody: 'some email' })
        const allEmailBodies = ["some email", "empty email", "some email"]
        const value=modelClass.getScoreToEmail(currentArray, allEmailBodies);
        expect(value).toEqual(correctMap);
    });
});

describe("HighestConfidence",function(){
    it("only returns the the highest confidence score",function() {
        let currentMap = new Map();
        currentMap.set(6.968050003051758, { answer: 'October 2, 2019', emailBody: 'some email' })
        currentMap.set(10.968050003051758, { answer: 'March 5, 2019', emailBody: 'another email' })
        currentMap.set(15.968050003051758, { answer: 'November 12, 2019', emailBody: 'a long email' })
        let value=modelClass.highestConfidence(currentMap);
        expect(value).toEqual(15.968050003051758);
    });
});

describe("extractEmailBodiesToArray",function(){
    it("only returns an array of email bodies from the Gmail dictionary of email properties",function() {
        
        let emailDict = {};
        const emailString1 = "This is body 1";
        const emailString2 = "This is body 2";
        let answerArray = [emailString1, emailString2];
        emailDict[12354876433322] = { "emailDate": 'October 2, 2019', "emailBody": emailString1 };
        emailDict[97654356423142] = { "emailDate": 'October 2, 2019', "emailBody": emailString2 };
        let value=modelClass.extractEmailBodiesToArray(emailDict);
        expect(value).toEqual(answerArray);
    });
});

