<?php
    class Session {
        public static function startSession() {
            session_start();
        }

        public static function isLoggedIn() {
            return isset($_SESSION["logged"]) && $_SESSION["logged"] === true;
        }

        public static function login() {
            $_SESSION["logged"] = true;
        }
    }
?>