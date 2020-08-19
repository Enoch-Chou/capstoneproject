
function main() {
    const gmail = new gmailAPI(getQuery());
    listMessages(gmail).then(() => mlClass.parseEmailsWithModel(gmail)
    );
}