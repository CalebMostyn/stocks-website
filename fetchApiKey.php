<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://caleb-mostyn.com'); // Adjust for security (e.g., only allow your domain)

$apiKey_1 = getenv('API_KEY_1');
$apiKey_2 = getenv('API_KEY_2'); 
echo json_encode(['API_KEY_1' => $apiKey_1, 'API_KEY_2' => $apiKey_2]);
?>
