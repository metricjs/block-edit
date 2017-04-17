var initPageCode = function() {
    console.log("Page inited!");
    checkUser();
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
                var data = "<h1>Welcome to BlockEdit!</h1><p>This is a temporary welcome file.</p>";
                createFile("BlockEdit Welcome", data, user.id);
            }
            console.log("User signed in");
            listUserFiles(user.id);
        }
    });
};

var createFile = function(name, data, userId) {
    var request = buildRequest("POST", data, name);

    request.execute(function(response) {
        console.log(response);
        $.post('backend/add_document.php', {
            user_id: userId,
            document_id: response.id,
            title: response.name
        }, function(response) {
            console.log("Adding document to db... " + response.success);
        });
    });
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
        return handleDeleteBtn(file.document_id);
    };
    optionsCell.appendChild(deleteBtn);
    row.appendChild(optionsCell);

    return row;
};

var handleEditBtn = function(fileId) {
    getFile(fileId);
};

var handleDeleteBtn = function(fileId) {
    deleteFile(fileId);
};

var getFile = function(file_id) {
    gapi.client.drive.files.get({
        'fileId': file_id,
        'alt': 'media'
    }).then(function(response) {
        // TODO: switch to edit mode
        console.log("Got " + file_id);
        console.log(response);
    });
};

var deleteFile = function(file_id) {
    gapi.client.drive.files.delete({
        'fileId': file_id
    }).then(function(response) {
        // TODO: delete from db too
        console.log("Deleted " + file_id);
        console.log(response);
    });
};