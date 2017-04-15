//Load common code that includes config, then load the app logic for this page.
define(
    "template",

    ['./config', './text!html_includes/header.html'],

    function (config, headerHtml) {
        var header = document.getElementById("header");
        header.innerHTML = headerHtml;

    }
);