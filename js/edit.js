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

var updateFile = function() {
    var fileId = parseUrl();
    var data = document.getElementById("be-edit-file-contents").innerHTML;

    var request = buildRequest("PATCH", data, fileId);

    request.execute(function(response) {
        console.log("File saved!");
        // TODO display to user
    });
};

var initTinyMCE = function() {
    tinymce.init({
        selector: '.be-block',
        inline: true,
        plugins: ["advlist lists"],
        menubar: "",
        toolbar: "undo redo | bold italic underline | styleselect | alignleft aligncenter alignright | bullist numlist | " +
            "addBlockAbove addBlockBelow | increaseBlockLevel decreaseBlockLevel | deleteBlock",
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
            editor.addButton('increaseBlockLevel', {
                text: 'Increase Block Level',
                icon: false,
                onclick: function () {
                    increaseBlockLevel();
                }
            });
            editor.addButton('decreaseBlockLevel', {
                text: 'Decrease Block Level',
                icon: false,
                onclick: function () {
                    decreaseBlockLevel();
                }
            });
            editor.addButton('deleteBlock', {
                text: 'Delete Block',
                icon: false,
                onclick: function() {
                    deleteBlock();
                }
            });
        }
    });
};

var addBlockBelow = function() {
    var currentBlock = getCurrentBlock();

    // Get block level of current block
    var levelClass = currentBlock.className.match(/[\w-]*lvl[\w-]*/g);

    // Insert new block after existing one
    var newBlock = document.createElement("div");
    newBlock.className = "be-block " + levelClass[0];
    newBlock.innerHTML = "<p>Content here.</p>";
    currentBlock.parentNode.insertBefore(newBlock, currentBlock.nextSibling);

    // Re-init Tiny
    initTinyMCE();
    setEditorFocus(newBlock);
};

var addBlockAbove = function() {
    var currentBlock = getCurrentBlock();

    // Get block level of current block
    var levelClass = currentBlock.className.match(/[\w-]*lvl[\w-]*/g);

    // Insert new block after existing one
    var newBlock = document.createElement("div");
    newBlock.className = "be-block " + levelClass[0];
    newBlock.innerHTML = "<p>Content here.</p>";
    currentBlock.parentNode.insertBefore(newBlock, currentBlock);

    // Re-init Tiny
    initTinyMCE();
    setEditorFocus(newBlock);
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
    setEditorFocus(currentBlock);
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
    setEditorFocus(currentBlock);
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
    return tinymce.activeEditor.getBody();
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
    var levelMargin = 50;
    // levelMargin = Math.max(document.getElementById("be-edit-file-contents").offsetWidth / 10, 165);
    // blocks are min 120 wide + 20 padding + 2 border

    var styleSheet = getStyleSheet("editStyles");

    [2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function(levelNum) {
        var selector = ".be-edit-mode-tree .be-block.be-block-lvl-" + levelNum;
        var margin = ((levelNum - 1) * levelMargin);
        var rule = selector + "{ left: " + margin + "px; }";
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
    var blocks = document.getElementsByClassName("be-block");
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

    changeModeToDoc(); // TODO: set to last mode?
    initTinyMCE();
    setEditorFocus(target);
};

var setEditorFocus = function(block) {
    tinymce.get(block.id).focus();
};
