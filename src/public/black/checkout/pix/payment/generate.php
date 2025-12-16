<?php
    require_once(__DIR__."../../vendor/autoload.php");
    
    use chillerlan\QRCode\QRCode;

    class CreatePix {
        public static function create_code($px) {
            $ret = "";

            foreach ($px as $k => $v) {
                if (!is_array($v)) {
                    if ($k == 54) {
                        $v = number_format($v, 2, ".", "");
                    } else {
                        $v = self::removeSpecialChars($v);
                    }
                    $ret .= self::c2($k).self::cpm($v).$v;
                } else {
                    $content = self::create_code($v);
                    $ret .= self::c2($k).self::cpm($content).$content;
                }
            }

            return $ret;
        }

        private static function removeSpecialChars($txt) {
            return preg_replace('/\W /', '', self::removeAccents($txt));
        }
        
        private static function removeAccents($text) {
            $search = explode(",", "à,á,â,ä,æ,ã,å,ā,ç,ć,č,è,é,ê,ë,ē,ė,ę,î,ï,í,ī,į,ì,ł,ñ,ń,ô,ö,ò,ó,œ,ø,ō,õ,ß,ś,š,û,ü,ù,ú,ū,ÿ,ž,ź,ż,À,Á,Â,Ä,Æ,Ã,Å,Ā,Ç,Ć,Č,È,É,Ê,Ë,Ē,Ė,Ę,Î,Ï,Í,Ī,Į,Ì,Ł,Ñ,Ń,Ô,Ö,Ò,Ó,Œ,Ø,Ō,Õ,Ś,Š,Û,Ü,Ù,Ú,Ū,Ÿ,Ž,Ź,Ż");
            $replace = explode(",", "a,a,a,a,a,a,a,a,c,c,c,e,e,e,e,e,e,e,i,i,i,i,i,i,l,n,n,o,o,o,o,o,o,o,s,s,s,u,u,u,u,u,y,z,z,z,A,A,A,A,A,A,A,A,C,C,C,E,E,E,E,E,E,E,I,I,I,I,I,I,L,N,N,O,O,O,O,O,O,O,O,S,S,U,U,U,U,U,Y,Z,Z,Z");
            return self::removeEmoji(str_replace($search, $replace, $text));
        }
        
        private static function removeEmoji($string) {
            return preg_replace('%(?:
            \xF0[\x90-\xBF][\x80-\xBF]{2}
        | [\xF1-\xF3][\x80-\xBF]{3}
        | \xF4[\x80-\x8F][\x80-\xBF]{2}
        )%xs', '  ', $string);
        }
        
        private static function cpm($text) {
            if (strlen($text) > 99) {
                die("Maximum length should be 99, invalid: $text has " . strlen($text) . " characters.");
            }

            return self::c2(strlen($text));
        }
        
        private static function c2($input) {
            return str_pad($input, 2, "0", STR_PAD_LEFT);
        }
        
        public static function crcChecksum($str) {
            function charCodeAt($str, $i) {
                return ord(substr($str, $i, 1));
            }
        
            $crc = 0xFFFF;

            for ($c = 0; $c < strlen($str); $c++) {
                $crc ^= charCodeAt($str, $c) << 8;
                for ($i = 0; $i < 8; $i++) {
                    if ($crc & 0x8000) {
                        $crc = ($crc << 1) ^ 0x1021;
                    } else {
                        $crc = $crc << 1;
                    }
                }
            }

            $hex = $crc & 0xFFFF;
            $hex = dechex($hex);
            $hex = strtoupper($hex);
            $hex = str_pad($hex, 4, '0', STR_PAD_LEFT);
        
            return $hex;
        }
    }

    class Pix {
        public static function get_code($value) {
            $pix[00] = "01";
            $pix[26][00] = "BR.GOV.BCB.PIX";
            $pix[26][01] = PIX_KEY;
            $pix[52] = "0000";
            $pix[53] = "986";
            $pix[54] = (float) $value;
            $pix[58] = "BR";
            $pix[59] = "DECOLAR";
            $pix[60] = "SAO PAULO";
            $pix[62][05] = "***";
            $pix = CreatePix::create_code($pix);
            $pix .= "6304";
            $pix .= CreatePix::crcChecksum($pix);

            return $pix;
        }

        public static function get_qrcode($pix_code) {
            $qrcode = new QRCode;
            return $qrcode->render($pix_code);
        }
    }
?>
