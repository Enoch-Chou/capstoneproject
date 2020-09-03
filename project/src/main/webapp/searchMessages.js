function searchMessages() {
    const gmail = new GmailAPI();
    gmail.getQuery();
    if (gmail.question === '') {
        alert("Please enter a question!");
        document.getElementById("map").style.display = "none";
        return;
    }
    gmail.listMessages().then(() => mlClass.parseEmailsWithModel(gmail)
    );
}