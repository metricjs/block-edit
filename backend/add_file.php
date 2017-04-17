<?php

session_start();

require_once "common.php";

header('Content-Type: application/json');

$success = false;
if (isset($_POST['user_id']) && isset($_POST['document_id']) && isset($_POST['title'])) {
    $db = connect_database();

    $query = $db->prepare("INSERT INTO documents (user_id, document_id, title) VALUES (?, ?, ?)");
    $query->execute(array($_POST['user_id'], $_POST['document_id'], $_POST['title']));

    $success = true;
}

echo json_encode(["success" => $success]);