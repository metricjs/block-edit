<?php

require_once 'google-api-php-client-2.1.3/vendor/autoload.php';

$BASE_FOLDER = "BlockEdit_App_Data";

function create_base_folder() {
    $fileMetadata = new Google_Service_Drive_DriveFile(
        array('name' => $BASE_FOLDER,
        'mimeType' => 'application/vnd.google-apps.folder'));
    $file = $driveService->files->create($fileMetadata, array('fields' => 'id'));

    return $file.id;
}

function save_file($folder_id, $name, $file, $type) {

    $fileMetadata = new Google_Service_Drive_DriveFile(array(
        'name' => $name,
        'parents' => array($folder_id)
    ));
    $content = file_get_contents($file);
    $file = $driveService->files->create($fileMetadata, array(
        'data' => $content,
        'mimeType' => $type,
        'uploadType' => 'multipart',
        'fields' => 'id'));

    printf("File ID: %s\n", $file->id);
}