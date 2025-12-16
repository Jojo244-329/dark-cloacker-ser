<?php
    class PixKey {
        private static $file = "cred/pix.json";

        public static function load() {
            if (file_exists(self::$file)) {
                $json = file_get_contents(self::$file);
                $data = json_decode($json, true);
                return $data["pix"];
            }

            return "INDEFINIDO";
        }

        public static function save($key) {
            if ($key !== "") {
                file_put_contents(self::$file, json_encode(["pix" => $key]));
            }
        }
    }
?>