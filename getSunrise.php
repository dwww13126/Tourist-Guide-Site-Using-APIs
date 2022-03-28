<?php
  $lat = urlencode($_GET['lat']);
  $lon = urlencode($_GET['lng']);
  //Set up the endpoint for the request with the required parameters to call
  $REQ_URL = "api.sunrise-sunset.org/json";
  $request = '?lat='.$lat.'&lng='.$lon.'&date=today';
  $ws_call = $REQ_URL.$request;
  //Initialise the connection using curl_init
  $connection = curl_init($ws_call);
  //Configure the connection using curl_setopt
  curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);
  //Make the request and get the response using curl_exec
  $response = curl_exec($connection);
  //Close the connection
  curl_close($connection);
  //Return the result as json
  echo $response;
?>
