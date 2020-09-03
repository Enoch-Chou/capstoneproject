/* Classify type of question into location-based or time-based questions*/
function classifyQuestionType(userInput) {
    var searchQuery = userInput.split(" ");
    if (searchQuery[0].toLowerCase() == 'where') {
        return 'Place';
    } else if (searchQuery[0].toLowerCase() == 'when' || (searchQuery[0].toLowerCase() == 'what' && searchQuery[1].toLowerCase() == 'time')){
        return 'Time';
    } else {
        return 'None';
    }
}

/* A Javascript implementation of the keyword extraction algorithm that identifies keywords based on parts of speech.*/
async function datamuseKeywordExtraction(userInput) {
    var result = "";
    var count = 0;
    var searchQuery = userInput.split(" ");
    for (word of searchQuery){
        if ((searchQuery.length - 1) == count && word.indexOf('?') != -1) {
                word = word.substring(0, word.length-1);
            }
        var url = new URL("https://api.datamuse.com/words?md=p&sp=" + word + "&max=1");
        const output = await fetch(url).then(response => response.text());
        if (output.includes("[\"n\"]") == true || output.includes("[\"adj\"]") == true){
            result += word;
            if (count != (searchQuery.length - 1)){
                result += " ";
            }
        }
        count++;
    }
    return result;
}

