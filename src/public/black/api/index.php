<?php
    header("Content-Type: application/json");

    $results = [];

    if (!isset($_GET['airport']) || empty($_GET['airport'])) {
        die(json_encode(["error" => "please provide the 'airport' parameter in GET"]));
    }

    $airport = urlencode($_GET['airport']);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "https://www.decolar.com/suggestions?locale=pt_BR&profile=sbox-flights&hint={$airport}",
        CURLOPT_RETURNTRANSFER => true
    ]);

    $response = json_decode(curl_exec($ch));
    curl_close($ch);

    if ($response && isset($response->items)) {
        foreach ($response->items as $item) {
            foreach ($item->items as $local) {
                $results[] = $local->display;
            }
        }
    } else {
        die(json_encode(["error" => "invalid response or missing items"]));
    }

    echo json_encode($results, JSON_PRETTY_PRINT);
?>