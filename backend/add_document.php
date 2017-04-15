<?php

session_start();

require_once "common.php";

header('Content-Type: application/json');

$success = false;
if (isset($_POST['user_id']) && isset($_POST['document_id']) && isset($_POST['title'])) {
    $success = add_document($_POST['user_id'], $_POST['document_id'], $_POST['title']);
}

echo json_encode(["success" => $success]);