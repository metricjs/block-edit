var getFile = function(fileId) {
    return new Promise(function (resolve, reject) {
        gapi.client.drive.files.get({
            'fileId': fileId,
            'alt': 'media'
        }).then(function (response) {
            resolve(response);
        }, function () {
            reject();
        });
    });
};

var getFileTitle = function(fileId) {
    return new Promise(function (resolve, reject) {
        $.post('backend/get_file_name.php', {
            file_id: fileId
        }, function (response) {
            if (response.title.length > 0) {
                resolve(response.title);
            } else {
                reject();
            }
        });
    });
};

var parseUrl = function() {
    var url = window.location.href;
    return url.split("?")[1].split("=")[1]; // Only one param "id" so no need for a loop
};

var displayFile = function() {
    var fileId = parseUrl();

    var fileTitlePromise = getFileTitle(fileId);
    fileTitlePromise.then(function (title) {
        var fileTitleOuter = document.getElementById("be-edit-file-title");
        fileTitleOuter.innerHTML = title;
        document.getElementById("be-edit-breadcrumb-file-title").innerHTML = title;
    }, function () {
       console.log("Retrieving file title failed");
    });

    var fileDataPromise = getFile(fileId);
    fileDataPromise.then(function(data) {
        var fileContentsOuter = document.getElementById("be-edit-file-contents");
        fileContentsOuter.innerHTML = data.body;
        initTinyMCE();
    }, function () {
        console.log("Retrieving file data failed");
    });

};

var initTinyMCE = function() {
    tinymce.init({
        selector: '.be-block',
        inline: true,
        plugins: ["advlist lists"],
        menubar: "",
        toolbar: "undo redo | bold italic underline | styleselect | alignleft aligncenter alignright | bullist numlist | addBlockAbove addBlockBelow",
        setup: function (editor) {
            editor.addButton('addBlockBelow', {
                text: 'Add Block Below',
                icon: false,
                onclick: function () {
                    addBlockBelow();
                }
            });
            editor.addButton('addBlockAbove', {
                text: 'Add Block Above',
                icon: false,
                onclick: function () {
                    addBlockAbove();
                }
            });
        }
    });
};

var addBlockBelow = function() {
    var editor = tinymce.activeEditor;
    var newBlockPlaceholder = "<span id='be-edit-new-placeholder'>&nbsp;</span>";
    editor.setContent(editor.getContent() + newBlockPlaceholder);

    editor.destroy();

    // Get parent and remove placeholder
    var placeholderElement = document.getElementById("be-edit-new-placeholder");
    var editorParent = placeholderElement.parentNode.parentNode;
    placeholderElement.parentNode.removeChild(placeholderElement);

    // Insert new block after existing one
    var newBlock = document.createElement("div");
    newBlock.className = "be-block";
    newBlock.innerHTML = "<p>Content here.</p>";
    editorParent.parentNode.insertBefore(newBlock, editorParent.nextSibling);

    // Re-init Tiny
    initTinyMCE();
};

var addBlockAbove = function() {
    var editor = tinymce.activeEditor;
    var newBlockPlaceholder = "<span id='be-edit-new-placeholder'>&nbsp;</span>";
    editor.setContent(editor.getContent() + newBlockPlaceholder);

    editor.destroy();

    // Get parent and remove placeholder
    var placeholderElement = document.getElementById("be-edit-new-placeholder");
    var editorParent = placeholderElement.parentNode.parentNode;
    editorParent.removeChild(placeholderElement.parentNode);

    // Insert new block after existing one
    var newBlock = document.createElement("div");
    newBlock.className = "be-block";
    newBlock.innerHTML = "<p>Content here.</p>";
    editorParent.parentNode.insertBefore(newBlock, editorParent);

    // Re-init Tiny
    initTinyMCE();
};