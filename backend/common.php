<?php

function connect_database() {
    $user = 'app';
    $db = new PDO('mysql:host=localhost;dbname=blockedit', $user, '') or die("Cannot open database");
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

    $query = $db->prepare("INSERT INTO users (id, name, email, token) VALUES (?, ?, ?, ?)");
    $query->execute(array($id, $name, $email, $token));

    return true;
}

function add_document($user_id, $document_id, $title) {
    $db = connect_database();

    $query = $db->prepare("INSERT INTO documents (user_id, document_id, title) VALUES (?, ?, ?)");
    $query->execute(array($user_id, $document_id, $title));

    return true;
}
