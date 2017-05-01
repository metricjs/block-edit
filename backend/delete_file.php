<?php

session_start();

require_once "common.php";

header('Content-Type: application/json');

$success = false;
if (isset($_POST['file_id'])) {
    $db = connect_database();

    $query = $db->prepare("DELETE FROM documents WHERE document_id=?");
    $query->execute(array($_POST['file_id']));

    $success = true;
}

echo json_encode(["success" => $success]);