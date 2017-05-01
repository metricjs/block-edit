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
                var data = "<div class='be-block'><h1>Welcome to BlockEdit!</h1><p>This is a temporary welcome file.</p></div>";
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

var updateFile = function(fileId, data) {
    var request = buildRequest("PATCH", data, fileId);

    request.execute(function(response) {
        console.log(response);
    });
};

/**
 * Create file:
 * method path = POST /upload/drive/v3/files
 * has 'name' metadata field
 *
 * Update file:
 * method path = PATCH /upload/drive/v3/files/fileId
 * no 'name'
 *
 * fileRef is therefore either 'name' or 'fileId' depending on the method
 */
var buildRequest = function(method, data, fileRef) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var contentType = "text/html";

    var metadata = {
        'mimeType': contentType,
        'parents': ["appDataFolder"]
    };

    if (method === "POST") {
        metadata['name'] = fileRef;
    }

    var multipartRequestBody =
        delimiter +  'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter + 'Content-Type: ' + contentType + '\r\n' + '\r\n' +
        data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v3/files',
        'method': method,
        'params': {'uploadType': 'multipart'},
        'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    if (method === "PATCH") {
        request['path'] += fileRef;
    }

    return request;
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
    var newFileContent = "<div class='be-block'><p>Content here.</p></div>";
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