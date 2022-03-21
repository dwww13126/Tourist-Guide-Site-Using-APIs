<?php
  $api_key = 'YourAPIKey';
  $lat = urlencode($_GET['latitude']);
  $lon = urlencode($_GET['longitude']);
  //set up the endpoint for the request with the required parameters to call
  $REQ_URL = "api.openweathermap.org/data/2.5/weather";
  $request = '?lat='.$lat.'&lon='.$lon.'&mode=xml'.'&appid='.$api_key.'&units=metric';
  $ws_call = $REQ_URL.$request;
  //initialise the connection using curl_init
  $connection = curl_init($ws_call);
  //configure the connection using curl_setopt
  curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);
  //make the request and get the response using curl_exec
  $response = curl_exec($connection);
  //close the connection
  curl_close($connection);
  //return the result as json
  echo $response;
?>
