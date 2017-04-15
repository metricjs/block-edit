<?php

session_start();

require_once "common.php";

header('Content-Type: application/json');

$success = false;
if (isset($_POST['user_id']) && isset($_POST['base_folder_id'])) {
    $db = connect_database();

    $query = $db->prepare("UPDATE users SET base_folder_id=? WHERE id=?");
    $query->execute(array($_POST['base_folder_id'], $_POST['user_id']));

    $success = true;
}

echo json_encode(["success" => $success]);