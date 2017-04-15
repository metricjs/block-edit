<?php

/*
 * Checks if a user exists on login. If yes, last_login is updated. If no, a record is created for them.
 *
 * Takes POST args:
 *  - id = Google user ID
 *  - name = user's name from their Google profile
 *  - email = user's email from their Google data
 */

session_start();

require_once "common.php";

header('Content-Type: application/json');

$count = -1;

if (isset($_POST['id'])) {
    $count = check_user($_POST['id']);

    if ($count < 1) {
        if (isset($_POST['id']) && isset($_POST['name']) && isset($_POST['email']) && isset($_POST['token'])) {
            create_user($_POST['id'], $_POST['name'], $_POST['email'], $_POST['token']);
        } else {
            $count = -1;
        }
    } else {
        update_user_last_login($_POST['id']);
    }
}

echo json_encode(["count" => $count]);