<?php

session_start();

require_once "common.php";

header('Content-Type: application/json');

$title = "";
if (isset($_POST['file_id'])) {
    $db = connect_database();

    $query = $db->prepare("SELECT title FROM documents WHERE document_id=?");
    $query->execute(array($_POST['file_id']));

    $title = $query->fetch(PDO::FETCH_NUM);
}

echo json_encode(["title" => $title]);