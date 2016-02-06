<?php
//
//      Quassel Backlog Search - classes
//      developed 2009 by m4yer <m4yer@minad.de> under a Creative Commons Licence by-nc-sa 3.0
//
//      password hashing improvements developed 2015 by mamarley
//
  
function initialAuthenticateUser($plainPassword,$dbHashedPassword,$hashVersion){
    switch($hashVersion){
        case null:
        case 0:
            return initialCheckHashedPasswordSha1($plainPassword,$dbHashedPassword);
            break;
        case 1:
            return initialCheckHashedPasswordSha2_512($plainPassword,$dbHashedPassword);
            break;
        default:
            return false;
            break;
    }
}
  
function initialCheckHashedPasswordSha1($plainPassword,$dbHashedPassword){
    $calculatedPasswordHash=hash("sha1",$plainPassword);
  
    if($calculatedPasswordHash==$dbHashedPassword){
        return $calculatedPasswordHash;
    }
  
    return false;
}
  
function initialCheckHashedPasswordSha2_512($plainPassword,$dbHashedPassword){
    $dbHashedPasswordArray=explode(":",$dbHashedPassword);
  
    if(count($dbHashedPasswordArray)==2){
        $calculatedPasswordHash=hash("sha512",$plainPassword . $dbHashedPasswordArray[1]);
        if($calculatedPasswordHash==$dbHashedPasswordArray[0]){
            return $dbHashedPasswordArray[0];
        }
    }
  
    return false;
}
  
?>