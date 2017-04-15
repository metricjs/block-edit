<?php

session_start();

require_once "common.php";

header('Content-Type: application/json');

$data = array();
if (isset($_POST['user_id'])) {
    $db = connect_database();

    $query = $db->prepare("SELECT * FROM documents WHERE user_id=?");
    $query->execute(array($_POST['user_id']));

    $result = $query->setFetchMode(PDO::FETCH_ASSOC);
    foreach ($query->fetchAll() as $row) {
        $data[] = $row;
    }
}

echo json_encode(["data" => $data]);