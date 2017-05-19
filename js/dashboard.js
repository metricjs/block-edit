var welcomeDocContents = function() {
    var contents =
        "<div class='be-block be-block-lvl-1'>" +
        "<h1>Welcome to BlockEdit!</h1>" +
        "<p>Ever wanted a writing app with more of a focus on document structure? I certainly have. I originally dreamed " +
        "up BlockEdit when I was writing my thesis, because I found myself constantly needing to reorder the sections of " +
        "my document as I added and removed parts. Copying and pasting sections inevitably ended with bits getting left " +
        "behind, formatting getting messed up, and sometimes me realising I'd been right in the first place and having " +
        "to move sections back again.</p>" +
        "<p>I also often wished that there was an easier way to see the overall structure of a document at a glance. " +
        "Document outlines using headings and such are a start, but they don't help as much if you have a couple pages " +
        "of content under one heading.</p>" +
        "<p>So ever since, I've been thinking about how a writing application could show the writer document structure " +
        "more easily, and how to help writers with structuring their documents. Hence BlockEdit was born.</p>" +
        "</div>";
    contents +=
        "<div class='be-block be-block-lvl-1'>" +
        "<p>The key difference between BlockEdit and other writing applications is that every document is divided up into " +
        "<strong>blocks</strong>. Each block has a light border around it to differentiate it from the other blocks, and " +
        "when editing a document each block has its own editing toolbar (courtesy of TinyMCE), rather than there being one " +
        "for the whole document. That toolbar also only appears when you click into a block, rather than always being " +
        "visible. </p>" +
        "<p>Blocks can contain any amount of content, from a single heading to pages of paragraphs. At the moment blocks " +
        "can't contain images, though I plan to implement that in the future.</p>" +
        "</div>";
    contents +=
        "<div class='be-block be-block-lvl-2'>" +
        "<p>If you click into a block so the editing toolar appears, you'll notice some standard document formatting " +
        "buttons plus some custom ones. These are: </p>" +
        "<ul> " +
            "<li>Add Block Above - Inserts a block above the currently active one</li>" +
            "<li>Add Block Below - Inserts a block below the currently active one</li>" +
            "<li>Increase Block Level - Increases the hierarchical level of the active block</li>" +
            "<li>Decrease Block Level - Decreases the hierarchical level of the active block</li>" +
            "<li>Delete Block - Does what it says. It does ask for confirmation though, since this can't be undo short " +
            "of reloading the page without saving.</li>" +
        "</ul>" +
        "<p>The first two are pretty simple, but you're probably asking what <strong>block level</strong> is. </p>" +
        "</div>";
    contents +=
        "<div class='be-block be-block-lvl-3'>" +
        "<p>This is where being able to easily see document structure comes into it. At the top right of the page you'll " +
        "see a few buttons. Save does the obvious, but the other three require a bit of explanation. </p>" +
        "<ul> " +
            "<li>Document Mode - The default mode that looks most like a traditional writing application, all blocks are " +
            "displayed as if they have the same level. Allows editing of block content.</li>" +
            "<li>Block Mode - Like document mode but each block is indented so far according to its level. The higher the " +
            "level (up to the maximum level of 10), the further the block is indented. Allows editing of block content.</li>" +
            "<li>Tree Mode - The only mode that doesn't allow editing of block content, this mode is purely for viewing " +
            "the structur of a document. Small previews of each block's content are arranged such that each hierarchical " +
            "level has it's own column and consecutive blocks with increasing levels are arranged in rows. Clicking a " +
            "block in this mode will take you back to Document mode to allow you to edit it. </li>" +
        "</ul>" +
        "<p>Tree mode is the strangest of the three, so I would suggest having a play with it to figure it out.</p>" +
        "</div>";
    contents +=
        "<div class='be-block be-block-lvl-1'>" +
        "<p>That's about all there is to learn! I've tried to keep the application as simple as possible while also " +
        "making it as useful as possible for its intended purposes; hopefully I've achieved that. There is certainly " +
        "more yet to be done to make it a truly useful and polished application, but it's well on its way to being the " +
        "writing application I dreamed of. </p>" +
        "<p>- Millie Macdonald</p>" +
        "</div>";

    return contents;
};

var newDocContents = function() {
    return "<div class='be-block be-block-lvl-1'><p>Content here.</p></div>";
};

var checkUser = function() {
    console.log("Checking user...");

    var user = getUser();

    $.post('backend/check_user.php', user, function (r) {
        if (r.count < 0) {
            console.log("Sign in failed");
            // TODO: catch this
        } else {
            if (r.count < 1) {
                console.log("User created");
                var data = welcomeDocContents();
                createFile("BlockEdit Welcome", data, user.id);
            }
            console.log("User signed in");
            listUserFiles(user.id);
        }
    });
};

var createFile = function(name, data, userId) {
    var gapiPromise = new Promise(function(resolve, reject) {

        var createInDb = function(response) {
            return new Promise(function (resolve, reject) {
                $.post('backend/add_file.php', {
                    user_id: userId,
                    document_id: response.id,
                    title: response.name
                }, function (response) {
                    if (response.success) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            });
        };

        var request = buildRequest("POST", data, name);

        console.log(request);

        request.then(function(response) {
            var dbPromise = createInDb(response.result);
            dbPromise.then(function () {
                resolve(response.result.id);
            }, function () {
                reject(response.result.id);
            });
        });

    });

    return gapiPromise;
};

var listUserFiles = function(userId) {
    $.post('backend/get_users_files.php', {
        user_id: userId
    }, function(response) {
        var files = response.data;
        var table = document.getElementById("be-file-list");

        var headingsRow = document.createElement("tr");
        var checkboxHeading = document.createElement("th");
        headingsRow.appendChild(checkboxHeading);
        var filesHeading = document.createElement("th");
        filesHeading.innerHTML = "Files";
        headingsRow.appendChild(filesHeading);
        var optionsHeading = document.createElement("th");
        optionsHeading.innerHTML = "Options";
        headingsRow.appendChild(optionsHeading);
        table.appendChild(headingsRow);

        for (var file in files) {
            table.appendChild(createFileTableRow(files[file]));
        }
    });
};

var createFileTableRow = function(file) {
    var row = document.createElement("tr");

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "be-file-list-box";
    checkbox.setAttribute("data-file-id", file.document_id);
    var checkboxCell = document.createElement("td");
    checkboxCell.appendChild(checkbox)
    row.appendChild(checkboxCell);

    var titleCell = document.createElement("td");
    titleCell.innerHTML = file.title;
    row.appendChild(titleCell);

    var optionsCell = document.createElement("td");
    var editBtn = document.createElement("button");
    editBtn.innerHTML = "Edit";
    editBtn.className = "be-file-list-btn-edit";
    editBtn.onclick = function() {
        return handleEditBtn(file.document_id);
    };
    optionsCell.appendChild(editBtn);
    var deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Delete";
    deleteBtn.className = "be-file-list-btn-delete";
    deleteBtn.onclick = function() {
        return handleSingleDeleteBtn(file.document_id, row);
    };
    optionsCell.appendChild(deleteBtn);
    row.appendChild(optionsCell);

    return row;
};

var assignMultiBtnHandlers = function() {
    var newBtn = document.getElementById("be-file-list-btn-new");
    var createBtn = document.getElementById("be-new-details-submit");
    var deleteMultiBtn = document.getElementById("be-file-list-btn-multi-delete");

    newBtn.onclick = function() {
        return handleNewBtn();
    };
    createBtn.onclick = function() {
        return handleCreateBtn();
    };
    deleteMultiBtn.onclick = function() {
        return handleMultiDeleteBtn();
    };
};

var handleNewBtn = function() {
    var details = document.getElementById("be-new-details");
    if (details.style.display === "none") {
        details.style.display = "block";
        details.style.visibility = "visible";
    } else {
        details.style.display = "none";
        details.style.visibility = "hidden";
    }
};

var handleCreateBtn = function() {
    var filename = document.getElementById("be-new-details-name").value;
    var newFileContent = newDocContents();
    var user = getUser();
    if (filename.length > 0) {
        var promise = createFile(filename, newFileContent, user.id);
        promise.then(function(fileId) {
            console.log(fileId);
            openFileToEdit(fileId);
        }, function() {
            console.log()
            console.log("Creating file failed");
        });

    } else {
        //TODO catch bad file name
    }
};

var handleEditBtn = function(fileId) {
    openFileToEdit(fileId);
};

var openFileToEdit = function(fileId) {
    window.location = "edit.html?id=" + fileId;
};

var handleSingleDeleteBtn = function(fileId, tableRow) {
    deleteFile(fileId, tableRow);
};

var handleMultiDeleteBtn = function() {
    var fileData = getSelectedFiles();
    for (var i = 0; i < fileData.fileIds.length; i++) {
        deleteFile(fileData.fileIds[i], fileData.tableRows[i]);
    }
};

var getSelectedFiles = function() {
    var boxes = document.getElementsByClassName("be-file-list-box");
    var fileIds = [];
    var tableRows = [];
    for (var i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            fileIds.push(boxes[i].getAttribute("data-file-id"));
            tableRows.push(boxes[i].parentNode.parentNode); // tr > td > input
        }
    }
    return { fileIds: fileIds, tableRows: tableRows };
};

var deleteFile = function(fileId, tableRow) {
    gapi.client.drive.files.delete({
        'fileId': fileId
    }).then(function() {
        $.post('backend/delete_file.php', {
            file_id: fileId
        }, function () {
            console.log("Deleted " + fileId + " from DB");
        });
        console.log("Deleted " + fileId + " from Google Drive");

        tableRow.parentNode.removeChild(tableRow);
    }, function() {
        console.log("Error deleting file");
    });

};