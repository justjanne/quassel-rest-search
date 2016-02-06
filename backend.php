<?php

require_once('auth_functions.php');

class Backend {

  private $dbh;
  private $user;
  
  public function connect($configfile) {
    $config = parse_ini_file($configfile);
    if ($config['local']) {
      $this->dbh = new PDO('pgsql:dbname='.$config['dbname'].' user='.$config['user'].' password='.$config['password']);
    } else {
      $this->dbh = new PDO('pgsql:host='.$config['host'].' port='.$config['port'].' dbname='.$config['dbname'].' user='.$config['user'].' password='.$config['password']);
    }
  }

  public function auth($username, $password) {
      if (!isset($username) || !isset($password))
        return false;

      $stmt = $this->dbh->prepare("SELECT * FROM quasseluser WHERE username = ?");
      $stmt->execute(array($_POST['username']));
      $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
      if (count($rows) !== 1)
        return false;
      
      $row = $rows[0];
      if (!initialAuthenticateUser($_POST['password'], $row['password'], $row['hashversion']))
        return false;
      
      $this->user = array(
        'id' => $row['userid'],
        'name' => $row['username']
      );
      return true;
  }
  
  public function find_buffers($arg_query, $arg_limit, $arg_offset) {
    $sql = "SELECT DISTINCT backlog.bufferid FROM backlog JOIN buffer ON backlog.bufferid = buffer.bufferid, to_tsquery('simple', ?) query WHERE type = 1 AND buffer.userid = ? AND to_tsvector('simple', message) @@ query LIMIT ? OFFSET ?;";
    $stmt = $this->dbh->prepare($sql);
    
    $limit = max(min($arg_limit, 20), 5);
    $offset = max(0, $arg_offset);

    $stmt->execute(array($arg_query, $this->user['id'], $limit, $offset));
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function search($arg_query, $arg_limit, $arg_offset, $arg_limit_each) {
    $buffers = $this->find_buffers($arg_query, $arg_limit, $arg_offset);
    
    $data = array();
    foreach ($buffers as $buffer) {
      $data = array_merge($data, $this->search_buffer($arg_query, $buffer['bufferid'], 4, 0)); 
    }
    return $data;
  }
  
  public function search_buffer($arg_query, $arg_buffer, $arg_limit, $arg_offset) {
    $sql = "SELECT backlog.messageid, backlog.bufferid, buffer.buffername, sender.sender, backlog.\"time\", network.networkname, ts_headline(backlog.message, query) AS message FROM backlog JOIN sender ON backlog.senderid = sender.senderid JOIN buffer ON backlog.bufferid = buffer.bufferid JOIN network ON buffer.networkid = network.networkid, to_tsquery('simple', ?) query WHERE type = 1 AND buffer.userid = ? AND backlog.bufferid = ? AND to_tsvector('simple', message) @@ query ORDER BY messageid DESC LIMIT ? OFFSET ?;";
    $stmt = $this->dbh->prepare($sql);
    
    $limit = max(min($arg_limit, 50), 1);
    $offset = max(0, $arg_offset);

    $stmt->execute(array($arg_query, $this->user['id'], $arg_buffer, $limit, $offset));
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
  public function after($arg_id, $arg_buffer, $arg_limit) {
    $sql = "SELECT backlog.messageid,  backlog.bufferid,  buffer.buffername,    sender.sender,    backlog.\"time\",    network.networkname,    backlog.message   FROM backlog     JOIN sender ON backlog.senderid = sender.senderid     JOIN buffer ON backlog.bufferid = buffer.bufferid     JOIN network ON buffer.networkid = network.networkid  WHERE buffer.userid = ?  AND backlog.bufferid = ?  AND messageid >= ?  ORDER BY messageid ASC  LIMIT ?;";
    $stmt = $this->dbh->prepare($sql);
    
    $limit = max(min($arg_limit+1, 50), 1);

    $stmt->execute(array($this->user['id'], $arg_buffer, $arg_id, $limit));
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
  public function before($arg_id, $arg_buffer, $arg_limit) {
    $sql = "SELECT backlog.messageid,  backlog.bufferid,  buffer.buffername,    sender.sender,    backlog.\"time\",    network.networkname,    backlog.message   FROM backlog     JOIN sender ON backlog.senderid = sender.senderid     JOIN buffer ON backlog.bufferid = buffer.bufferid     JOIN network ON buffer.networkid = network.networkid  WHERE buffer.userid = ?  AND backlog.bufferid = ?  AND messageid < ?  ORDER BY messageid DESC  LIMIT ?;";
    $stmt = $this->dbh->prepare($sql);
    
    $limit = max(min($arg_limit, 50), 0);

    $stmt->execute(array($this->user['id'], $arg_buffer, $arg_id, $limit));
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
  public function context($arg_id, $arg_buffer, $arg_before, $arg_after) {
    return array_merge(array_reverse($this->before($arg_id, $arg_buffer, $arg_before)), $this->after($arg_id, $arg_buffer, $arg_after));
  }
}

?>