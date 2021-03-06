//The API key for showing the town location on the map
let mapQuestApiKey = "YourAPIKey";

//Stores the map ellement for allowing locations to be shown by changing cordinates
let mymap;

//Sets up a XMLHttpRequest for getting the weather data from the API
let weather = new XMLHttpRequest();

//Allows for the locations that the user enters to be stored in an array
let _selectedLocations;

//Is used to be able to construct a location object to store all the required
//Properties
function locationl(name, lat, lon){
		//declare the data properties for the object and its UI
		let _name = name;
		let _lat = lat;
		let _lon = lon;
		//Creates a clickable dom ellement
		let locationDom = document.createElement("P");
		//Allows for the item to have css applied
		locationDom.className = "locationN";
		//Creates a text node with the passed in town name
		let locationDomMessage = document.createTextNode(_name);
		locationDom.appendChild(locationDomMessage);
		//Adds an event Listener to allow the ellement to clickable
		locationDom.addEventListener( "click", function() {
				clickLocation(_lat, _lon, _name);
		});
		//ALlows for the private values of the locations to be returned
		this.getName = function(){
			return name;
		}
		this.getLatitude = function(){
			return _lat;
		}
		this.getLongitude = function(){
			return _lon;
		}
		this.getDomElement = function(){
			return locationDom;
		}
}

//Sets the starting location for where the map will be located
function initializeMap() {
	//Calls the show on map function using the default location (Hamiton)
	mymap = L.map('mapid').setView([-37.78, 175.28], 13);
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox/streets-v11',
	    tileSize: 512,
	    zoomOffset: -1,
	    accessToken: 'pk.eyJ1IjoiZHd3MTMxMjYiLCJhIjoiY2tiYTZrdnVnMGwzNTJxbzEzOXlreWY0ZSJ9.QkQv0GGu7IxSvvTFdqnFGQ'
	}).addTo(mymap);
	//Sets up the location array
	_selectedLocations = [];
}

//Checks if there exists a location object inside _selectedLocations which has the same
//town name, returns the location object if a match is found, null if no match is found
function findLocation(locationName){
	//Go through each of the different locations to try find if a  location has prevously
	//been requested
	for (let i = 0; i < _selectedLocations.length; i++) {
		//If there already exsists a location with the same name
		if(_selectedLocations[i].getName().toLowerCase().localeCompare(locationName.toLowerCase()) == 0){
			//Reorders the location to have it come to the begining of the Recent Searches:
			reorderLocation(_selectedLocations[i].getName());
			//Return the location object
			return _selectedLocations[i];
		}
		//If no match is found then return null
		return null;
	}
}

//Edits the array of location objects to have a location which has been clicked
//or searched before to become first in the displayed ordering
function reorderLocation(locationName){
	//Go through each of the different locations to try find if a location has
	//is already in the recents list
	for (let i = 0; i < _selectedLocations.length; i++) {
		//If there already exsists a location with the same name
		if(_selectedLocations[i].getName().localeCompare(locationName) == 0){
			//Makes a copy of the location for adding back as the newest
			let duplicate = _selectedLocations[i];
			//Spices the _selectedLocations array to remove the duplicate
			_selectedLocations.splice(i, 1);
			//Adds the dupicate back
			_selectedLocations.push(duplicate);
			//Return true to say re-order occured
			return true;
		}
	}
	//Return false as there does not exist a _selectedLocations with
	//the same locationName
	return false;
}

//Uses fetch to request the geocoding data of an entered location
// and receive the results in JSON, once the results have been found
function geocodeLocation() {
	//get the location from the locationField
	let locationName = document.getElementById("locationField").value;
	//Puts the locationName to lower case
	locationName = locationName.toLowerCase();
	//Replaces white space before and after and removes duplicate spaces
	locationName = locationName.replace(/\s\s+/g, ' ');
	locationName = locationName.trim();
	//Calls the findLocation method and checks to see if the value returned is not
	//null (Value is found)
	let foundLocation = findLocation(locationName);
	if (foundLocation != null){
		//Request the weather using the foundLocation location data without
		//requesting the mapquestapi geocode
		requestWeather(foundLocation.getLatitude(), foundLocation.getLongitude());
	}
	//Else try request the location with mapquestapi
	else {
		//By default the country code used is NZ to get places from NZ
		let countryCode = "NZ";
		//Set up the request with the required parameters
		let url = "https://www.mapquestapi.com/geocoding/v1/address";
		let request = "?key=" + mapQuestApiKey + "&inFormat=kvp&outFormat=json&location=" + locationName + "%2C+" + countryCode + "&thumbMaps=false";
		let wsCall = url + request;
		//Calls fetch and sets up the callback method to show the location on the
		//map with the parsed JSON
		fetch(wsCall).then(response => response.json()).then(json => saveLocation(json));
	}
}

//Used to add a location to the array of locations that the user has
//not searched up before
function saveLocation(jsonGeocode) {
	//Checks to make sure that the city was found in New Zeland by reading the
	//result of the JSON
	let checkNZ = jsonGeocode.results[0].locations[0].adminArea1;
	//Assigns the location Name
	let locationN = jsonGeocode.results[0].locations[0].adminArea5;
	if (checkNZ.localeCompare("NZ") != 0) {
		//Give a popup message to let the user know that the city name entered does not
		//exist in New Zealand
		window.alert("Requested Town is not located in New Zealand");
		//Removes all the text from curWeather, sunTimes, max-temp and min-temp divs
		document.getElementById("curWeather").innerHTML = "";
		document.getElementById("sunTimes").innerHTML = "";
		document.getElementById("max-temp").innerHTML = "";
		document.getElementById("min-temp").innerHTML = "";
	}
	//Else create a location object
	else {
		//Reads the data from the JSON to be used in creating a new location object
		let gLatitude = jsonGeocode.results[0].locations[0].latLng.lat;
		let gLongitude = jsonGeocode.results[0].locations[0].latLng.lng;
		//Creates the location object used passed in parmeters
		let location = new locationl(locationN, gLatitude, gLongitude);
		//Otherwise checks the length of the _selectedLocations array
		//to see if it has reached the max length of 7
		if(_selectedLocations.length == 7){
			 //removes the oldest ellement
		  _selectedLocations = _selectedLocations.slice(1, 7);
		}
		//If reOrdered is false (Meaning that the locationN is new) then add the
		//location to _selectedLocations
		let reOrdered = reorderLocation(locationN);
		if(!reOrdered){
			_selectedLocations.push(location);
		}
		//Calls the weather request using the latitude and longitude from the JSON
		requestWeather(gLatitude, gLongitude);
		//Requests the sun times using the passed lat lon
		requestSunTimes(gLatitude, gLongitude, locationN);
	}
}

//Allows for a user to click on a town from thier recent searches
//and reorder the locations before performing the requestWeather
//and requestSunTimes API requests
function clickLocation(latitude, longitude, locationN) {
	reorderLocation(locationN);
	//Calls the weather request using the latitude and longitude
	requestWeather(latitude, longitude);
	//Requests the sun times using the passed lat lon and the location name
	requestSunTimes(latitude, longitude, locationN);
}

//Requests to receive the weather through using AJAX and cURL
function requestWeather(latitude, longitude){
	let url = "http://localhost/TouristGuide/getWeather.php?latitude=" + latitude + "&longitude=" + longitude;
	weather.onreadystatechange = updateInfo;
	weather.open("GET", url, true);
	weather.send("");
}

//Provides the status for the AJAX request
function updateInfo() {
  	if (weather.readyState == 4) {
    	if (weather.status == 200) {
      		let response = weather.responseText;
      		showWeather(response);
    	}
			else {
      alert("Error: " + weather.statusText);
    }
  }
}

//Is the callback used to display the weather to the user, uses a XML response
function showWeather(responseT){
	//Stores the responceXML
	var parser = new DOMParser();
	let xmlWeather = parser.parseFromString(responseT,"text/xml");
	//Sets the div to contain the text which shows the weather
	let weatherMessageDiv = document.getElementById("curWeather");
	weatherMessageDiv.innerHTML = '';
	let curP = document.createElement("P");
	let maxTempP = document.createElement("P");
	let minTempP = document.createElement("P");
	let curText = "Error requesting weather information";
	let maxTempText = "";
	let minTempText = "";
	let maxTempElement = document.getElementById("max-temp");
	let minTempElement = document.getElementById("min-temp");
	let curWeatherElement = document.getElementById("curWeather");
	//Checks to see if the request was successful by making sure that there are
	//no error code messages before performing the operations
	let errorCode = xmlWeather.getElementsByTagName("cod");
	if (errorCode.length < 1){
		//Reads and stores each of the required parts needed to display the weather
		let weather = xmlWeather.getElementsByTagName("weather")[0].getAttribute("value");
		let wind = xmlWeather.getElementsByTagName("speed")[0].getAttribute("name");
		let tMin = xmlWeather.getElementsByTagName("temperature")[0].getAttribute("min");
		let tMax = xmlWeather.getElementsByTagName("temperature")[0].getAttribute("max");
		//Creates the weather message and formats the text with a capital first followed
		//by everything else being lower case
		curText = "<strong>Current Condtion:</strong> " + weather.charAt(0).toUpperCase() + weather.slice(1) +
							" and " + wind.toLowerCase();
		maxTempText = "<strong>Max Temp:</strong> " + tMax + "°C";
		minTempText =  "<strong>Min Temp:</strong> " + tMin + "°C";
		//Show the location on the map
		let lat = xmlWeather.getElementsByTagName("coord")[0].getAttribute("lat");
		let lon = xmlWeather.getElementsByTagName("coord")[0].getAttribute("lon");
		showOnMap(lat, lon);
	}
	//Assigns the created messages to the P tags
	curP.innerHTML = curText;
	maxTempP.innerHTML = maxTempText;
	minTempP.innerHTML = minTempText;
	//Clears each of the ellements orignal content
	curWeatherElement.innerHTML = "";
	maxTempElement.innerHTML = "";
	minTempElement.innerHTML = "";
	//Appends the P tags to the relevent ellements on the page
	curWeatherElement.appendChild(curP);
	maxTempElement.appendChild(maxTempP);
	minTempElement.appendChild(minTempP);
}

//Used to show the location through the Geocoded data received back from
//the geocode location or locationObject
function showOnMap(latitude, longitude){
	//Uses the passed in latitude, longitude to set the location of the map
	mymap.setView([latitude, longitude], 13);
}

//Allows for the sunrise sunset to be requested by latitude and longitude
//using Fetch and cURL
function requestSunTimes(latitude, longitude, locationN) {
	//Runs the fetch request to find the SunTimes for the current day by using a server side script
	fetch("getSunrise.php?lat=" + latitude + "&lng=" + longitude).then(response => response.json()).then(json => showSunTimes(json, locationN));
}

//Uses what is returned to display the sun Set and Rise times on the page
function showSunTimes(responseT, townName){
	//Stores each of the diferent parts used in creating the sunText message
	//from reading the response text
	let sRiseUTC = responseT.results.sunrise;
	let sSetUTC = responseT.results.sunset;
	//Converts the date by using the local Month, Day, Year to ensure correct Daylight Savings Time
	//and appends the sun rise and sun set times from the UTC times received from the sunrise API
	let d = new Date();
	let nzDateRise = new Date("" + d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " " + sRiseUTC + " UTC");
	let nzDateSet = new Date("" + d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear() + " " + sSetUTC + " UTC");
	//Deletes the irrelevent parts of the date to only show the time with AM / PM
	let sRiseNZ = nzDateRise.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	let sSetNZ = nzDateSet.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
	//Gets the sunTimes div which needs to be updated and clear it
	let sunTimeDiv = document.getElementById("sunTimes");
	sunTimeDiv.innerHTML = "";
	//Creates and adds the message ellement to the sunTimeDiv
	let sunTimeMessageP = document.createElement("P");
	let sunText = "<strong>Sun Rise / Set:</strong> " + sRiseNZ + "  to " + sSetNZ;
	sunTimeMessageP.innerHTML = sunText;
	sunTimeDiv.appendChild(sunTimeMessageP);
	//Sets the searchbar to the API souced townName to fix any spelling mistakes
	//a user might have made entering the town
	document.getElementById("locationField").value = townName;
	//Once the location has been added go through and put the recent searches on
	//the page
	let recSearchesDiv = document.getElementById("recSearch");
	recSearchesDiv.innerHTML = '';
	//Goes through a loop of putting each of the location names on the page
	for (let i = _selectedLocations.length - 1; i >= 0; i--) {
		recSearchesDiv.appendChild(_selectedLocations[i].getDomElement());
	}
}
