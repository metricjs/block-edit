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
       console.log("ERROR: Retrieving file title failed");
    });

    var fileDataPromise = getFile(fileId);
    fileDataPromise.then(function(data) {
        var fileContentsOuter = document.getElementById("be-edit-file-contents");
        fileContentsOuter.innerHTML = data.body;
        initTinyMCE();
    }, function () {
        console.log("ERROR: Retrieving file data failed");
    });

};

var updateFile = function() {
    var fileId = parseUrl();
    var data = document.getElementById("be-edit-file-contents").innerHTML;

    var request = buildRequest("PATCH", data, fileId);

    request.execute(function(response) {
        changeBtnTextTemp(document.getElementById('be-edit-save'), 'Saved!', 'Save');
    });
};

var initTinyMCE = function() {
    tinymce.init({
        selector: '.be-block-content',
        inline: true,
        plugins: ["advlist lists"],
        menubar: "",
        toolbar: "undo redo | bold italic underline | styleselect | alignleft aligncenter alignright | bullist numlist " +
            "indent outdent | addBlockAbove addBlockBelow | increaseBlockLevel decreaseBlockLevel | deleteBlock",
        setup: function (editor) {
            editor.addButton('addBlockAbove', {
                image: 'images/addAbove.svg',
                tooltip: 'Add block above',
                onclick: function () {
                    addBlockAbove();
                }
            });
            editor.addButton('addBlockBelow', {
                image: 'images/addBelow.svg',
                tooltip: 'Add block below',
                onclick: function () {
                    addBlockBelow();
                }
            });
            editor.addButton('increaseBlockLevel', {
                image: 'images/indent.svg',
                tooltip: 'Increase block level',
                onclick: function () {
                    increaseBlockLevel();
                }
            });
            editor.addButton('decreaseBlockLevel', {
                image: 'images/outdent.svg',
                tooltip: 'Decrease block level',
                onclick: function () {
                    decreaseBlockLevel();
                }
            });
            editor.addButton('deleteBlock', {
                image: 'images/delete.svg',
                tooltip: 'Delete block',
                onclick: function() {
                    deleteBlock();
                }
            });
        }
    });
};

var newBlockContent = function() {
    return "<div class='be-block-handle'> </div>" +
        "<div class='be-block-content'>" +
        "<p>Content here.</p>" +
        "</div>";
};

var addBlockBelow = function() {
    var currentBlock = getCurrentBlock();

    // Get block level of current block
    var levelClass = currentBlock.className.match(/[\w-]*lvl[\w-]*/g);

    // Insert new block after existing one
    var newBlock = document.createElement("div");
    newBlock.className = "be-block " + levelClass[0];
    newBlock.innerHTML = newBlockContent();
    currentBlock.parentNode.insertBefore(newBlock, currentBlock.nextSibling);

    // Re-init Tiny
    initTinyMCE();
    setEditorFocus(newBlock.getElementsByClassName('be-block-content')[0]);
};

var addBlockAbove = function() {
    var currentBlock = getCurrentBlock();

    // Get block level of current block
    var levelClass = currentBlock.className.match(/[\w-]*lvl[\w-]*/g);

    // Insert new block after existing one
    var newBlock = document.createElement("div");
    newBlock.className = "be-block " + levelClass[0];
    newBlock.innerHTML = newBlockContent();
    currentBlock.parentNode.insertBefore(newBlock, currentBlock);

    // Re-init Tiny
    initTinyMCE();
    setEditorFocus(newBlock.getElementsByClassName('be-block-content')[0]);
};

var increaseBlockLevel = function() {
    var currentBlock = getCurrentBlock();

    // Get block level of current block
    var levelClass = currentBlock.className.match(/[\w-]*lvl[\w-]*/g)[0];
    var levelNum = parseInt(levelClass.substring("be-block-lvl-".length));

    if (levelNum < 10) {
        // Switch to new class
        var newClass = "be-block-lvl-" + (levelNum + 1);
        $(currentBlock).toggleClass(levelClass, false);
        $(currentBlock).toggleClass(newClass, true);
    }

    // Re-init Tiny
    initTinyMCE();
    setEditorFocus(currentBlock.getElementsByClassName('be-block-content')[0]);
};

var decreaseBlockLevel = function() {
    var currentBlock = getCurrentBlock();

    // Get block level of current block
    var levelClass = currentBlock.className.match(/[\w-]*lvl[\w-]*/g)[0];
    var levelNum = parseInt(levelClass.substring("be-block-lvl-".length));

    if (levelNum > 1) {
        // Switch to new class
        var newClass = "be-block-lvl-" + (levelNum - 1);
        $(currentBlock).toggleClass(levelClass, false);
        $(currentBlock).toggleClass(newClass, true);
    }

    // Re-init Tiny
    initTinyMCE();
    setEditorFocus(currentBlock.getElementsByClassName('be-block-content')[0]);
};

var deleteBlock = function() {
    if (confirm("Are you sure you want to delete this block? You can't undo this!") == true) {
        var currentBlock = getCurrentBlock();
        destroyAllEditors();
        currentBlock.parentNode.removeChild(currentBlock);
        initTinyMCE();
    }

};

var getCurrentBlock = function() {
    return tinymce.activeEditor.getBody().parentNode;
};

var changeModeToDoc = function() {
    toggleTreeOnclicks(false);

    var outer = document.getElementById("be-edit-file-contents");

    var docModeClass = "be-edit-mode-doc";
    var blockModeClass = "be-edit-mode-block";
    var treeModeClass = "be-edit-mode-tree";

    $(outer).toggleClass(docModeClass, true);
    $(outer).toggleClass(blockModeClass, false);
    $(outer).toggleClass(treeModeClass, false);

    $("#be-edit-mode-doc").toggleClass("be-edit-mode-active", true);
    $("#be-edit-mode-block").toggleClass("be-edit-mode-active", false);
    $("#be-edit-mode-tree").toggleClass("be-edit-mode-active", false);

    if(tinymce.editors.length === 0) {
        initTinyMCE();
    }
};

var changeModeToBlock = function() {
    toggleTreeOnclicks(false);

    var outer = document.getElementById("be-edit-file-contents");

    var docModeClass = "be-edit-mode-doc";
    var blockModeClass = "be-edit-mode-block";
    var treeModeClass = "be-edit-mode-tree";

    $(outer).toggleClass(docModeClass, false);
    $(outer).toggleClass(blockModeClass, true);
    $(outer).toggleClass(treeModeClass, false);

    $("#be-edit-mode-doc").toggleClass("be-edit-mode-active", false);
    $("#be-edit-mode-block").toggleClass("be-edit-mode-active", true);
    $("#be-edit-mode-tree").toggleClass("be-edit-mode-active", false);

    if(tinymce.editors.length === 0) {
        initTinyMCE();
    }
};

var changeModeToTree = function() {
    destroyAllEditors();
    setTreeModeMargins();
    toggleTreeOnclicks(true);

    var outer = document.getElementById("be-edit-file-contents");

    var docModeClass = "be-edit-mode-doc";
    var blockModeClass = "be-edit-mode-block";
    var treeModeClass = "be-edit-mode-tree";

    $(outer).toggleClass(docModeClass, false);
    $(outer).toggleClass(blockModeClass, false);
    $(outer).toggleClass(treeModeClass, true);

    $("#be-edit-mode-doc").toggleClass("be-edit-mode-active", false);
    $("#be-edit-mode-block").toggleClass("be-edit-mode-active", false);
    $("#be-edit-mode-tree").toggleClass("be-edit-mode-active", true);
};

var setTreeModeMargins = function() {
    var styleSheet = getStyleSheet("editStyles");

    [2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function(levelNum) {
        var selector = ".be-edit-mode-tree .be-block.be-block-lvl-" + levelNum;
        var margin = (levelNum - 1) * 5;
        var rule = selector + "{ left: " + margin + "%; }";
        styleSheet.insertRule(rule, levelNum - 2);
    });

};

function getStyleSheet(styleSheetTitle) {
    for(var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if(sheet.title == styleSheetTitle) {
            return sheet;
        }
    }
}

var destroyAllEditors = function() {
    var editors = tinymce.editors;
    for (var ed in editors) {
        editors[ed].remove();
    }
};

var toggleTreeOnclicks = function(state) {
    var blocks = document.getElementsByClassName("be-block-content");
    [].forEach.call(blocks, function(block) {
        if (state) {
            $(block).on('click', function(event) {
                return treeModeBlockOnClick(event.target);
            });
        } else {
            $(block).off('click');
        }
    });
};

var treeModeBlockOnClick = function(target) {
    toggleTreeOnclicks(false);
    changeModeToDoc();
    initTinyMCE();
    setEditorFocus(target);
};

var setEditorFocus = function(blockContent) {
    tinymce.get(blockContent.id).focus();
};

var changeBtnTextTemp = function(button, tempText, defaultText) {
    button.textContent = tempText;
    setTimeout(function() { button.textContent = defaultText; }, 3000);
};
