<?php
  require_once('backend.php');
  
  $backend = new Backend();
  $backend->connect('/var/www/config.ini');
  if (!$backend->auth($_POST['username'], $_POST['password'])) {
    header($_SERVER['SERVER_PROTOCOL'].' 403 Forbidden');
    header('Status: 403 Forbidden');
    exit;
  }
  
  header('Content-Type: application/json');
  echo json_encode($backend->context(intval($_GET['msg']),intval($_GET['buffer']),intval($_GET['before']),intval($_GET['after'])))."\n";
?>