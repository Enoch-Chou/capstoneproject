/** Initialize mlClass outside to have access to class outside of function */
let mlClass;
window.onload = function() {
    mlClass = new MLModelEmailParse();
}