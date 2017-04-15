//Load common code that includes config, then load the app logic for this page.
define(
    "template",

    ['./config', './userstate', './text!html_includes/header.html'],

    function (config, userstate, headerHtml) {
        var header = document.getElementById("header");
        header.innerHTML = headerHtml;

    }
);