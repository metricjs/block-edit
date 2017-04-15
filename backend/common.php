<?php

require_once "drive.php";

function connect_database() {
    $user = 'root';
    $pass = '';
    $db = new PDO('mysql:host=localhost;dbname=blockedit', $user, $pass) or die("Cannot open database");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
}

function check_user($id) {
    $db = connect_database();

    // See if there is a duplicate username
    $query = $db->prepare("SELECT count(*) FROM users WHERE id = ?");
    $query->execute(array($id));
    $count = $query->fetch(PDO::FETCH_NUM);
    $user_count = $count[0];

    return $user_count;
}

function create_user($id, $name, $email, $token) {
    $db = connect_database();
    $now = date("Y-m-d");

    $query = $db->prepare("INSERT INTO users (id, name, email, token, account_created, last_login) VALUES (?, ?, ?, ?, ?, ?)");
    $query->execute(array($id, $name, $email, $token, $now, $now));

    return true;
}

function update_user_last_login($id) {
    $db = connect_database();
    $now = date("Y-m-d");

    $query = $db->prepare("UPDATE users SET last_login = ? WHERE id = ?");
    $query->execute(array($now, $id));

    return true;
}

function add_document($user_id, $document_id, $title) {
    $db = connect_database();

    $query = $db->prepare("INSERT INTO documents (user_id, document_id, title) VALUES (?, ?, ?)");
    $query->execute(array($user_id, $document_id, $title));

    return true;
}
