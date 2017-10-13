<?php

namespace QuasselRestSearch;


class AuthHelper
{
    public static function initialAuthenticateUser($plainPassword, $dbHashedPassword, $hashVersion)
    {
        switch ($hashVersion) {
            case null:
            case 0:
                return AuthHelper::initialCheckHashedPasswordSha1($plainPassword, $dbHashedPassword);
                break;
            case 1:
                return AuthHelper::initialCheckHashedPasswordSha2_512($plainPassword, $dbHashedPassword);
                break;
            default:
                return false;
                break;
        }
    }

    public static function initialCheckHashedPasswordSha1($plainPassword, $dbHashedPassword)
    {
        $calculatedPasswordHash = hash("sha1", $plainPassword);

        if ($calculatedPasswordHash == $dbHashedPassword) {
            return $calculatedPasswordHash;
        }

        return false;
    }

    public static function initialCheckHashedPasswordSha2_512($plainPassword, $dbHashedPassword)
    {
        $dbHashedPasswordArray = explode(":", $dbHashedPassword);

        if (count($dbHashedPasswordArray) == 2) {
            $calculatedPasswordHash = hash("sha512", $plainPassword . $dbHashedPasswordArray[1]);
            if ($calculatedPasswordHash == $dbHashedPasswordArray[0]) {
                return $dbHashedPasswordArray[0];
            }
        }

        return false;
    }

    public static function parseAuthHeader($authHeader): array
    {
        $arr = explode(':', base64_decode($authHeader));
        if (count($arr) != 2) {
            throw new \Exception("Can’t parse authentication header");
        } else {
            return [
                'username' => base64_decode($arr[0]),
                'password' => base64_decode($arr[1])
            ];
        }
    }

    public static function generateAuthHeader(string $password, string $username): string
    {
        return base64_encode(base64_encode($username) . ":" . base64_encode($password));
    }
}