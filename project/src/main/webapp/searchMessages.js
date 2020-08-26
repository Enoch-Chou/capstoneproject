function searchMessages() {
    const query = getQuery();
    if (query.length == 0) {
        console.log("Please enter a question!");
        return;
    }
    const gmail = new GmailAPI(query);
    gmail.listMessages(query).then(() => mlClass.parseEmailsWithModel(gmail)
    );
}