<?php
  require_once('backend.php');
  
  $backend = new Backend();
  $backend->connect('config.ini');
  if (!$backend->auth($_POST['username'], $_POST['password'])) {
    header($_SERVER['SERVER_PROTOCOL'].' 403 Forbidden');
    header('Status: 403 Forbidden');
    exit;
  }
  
  header('Content-Type: application/json');
  echo json_encode($backend->search_buffer($_GET['query'],$_GET['buffer'],$_GET['limit'],$_GET['offset']))."\n";
?>