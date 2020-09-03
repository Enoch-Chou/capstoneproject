function editedKeywordExtraction(userInput) {
    var searchQuery = userInput.split(" ");
    if (searchQuery[0].toLowerCase() == 'where') {
        return 'Place';
    } else if (searchQuery[0].toLowerCase() == 'when' || (searchQuery[0].toLowerCase() == 'what' && searchQuery[1].toLowerCase() == 'time')){
        return 'Time';
    } else {
        return 'None';
    }
}