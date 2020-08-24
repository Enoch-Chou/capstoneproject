function main() {
    const query = getQuery();
    if (query.length == 0) {
        console.log("Please enter a question!");
        return;
    }
    const gmail = new gmailAPI(query);
    listMessages(gmail).then(() => mlClass.parseEmailsWithModel(gmail)
    );
}