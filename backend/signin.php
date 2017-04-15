<?php

$client = new Google_Client();
$client->setAuthConfig('resources/client_secrets.json');
$client->setIncludeGrantedScopes(true);   // incremental auth
$client->addScope(Google_Service_Drive::DRIVE_APPDATA);
$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback.php');