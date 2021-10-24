const api_key = "5ae2e3f221c38a28845f05b68abc888983ac3b55703b29d96f3bf7a2";

//Intializing the Google map
let map, infoWindow;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 10,
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          getCity(lat, lng);

          latInfo(lat, lng);

          map.setCenter(pos);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });
}

// get city name
function getCity(lat, lng) {
  var xhr = new XMLHttpRequest();
  var lat = lat;
  var lng = lng;

  // Paste your LocationIQ token below.
  xhr.open(
    "GET",
    "https://us1.locationiq.com/v1/reverse.php?key=pk.b489638ebd288c72d74f5d8d49ab6c5c&lat=" +
      lat +
      "&lon=" +
      lng +
      "&format=json",
    true
  );
  xhr.send();
  xhr.onreadystatechange = processRequest;
  xhr.addEventListener("readystatechange", processRequest, false);

  function processRequest(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var response = JSON.parse(xhr.responseText);
      console.log(response);
      var city = response.address.city;
      var state = response.address.state;
      console.log(state);
      return;
    }
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

// function to call API function
//Calling the IP Api and Updating the map
function latInfo(lat, lng) {
  let url = `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${lng}&lat=${lat}&kinds=interesting_places&apikey=${api_key}`;

  console.log(url);
  fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);

      let len = data.features.length;
      let locations = [];

      for (let i = 0; i < len; i++) {
        let lan = data.features[i].geometry.coordinates;
        let name = data.features[i].properties.name;
        let xid = data.features[i].properties.xid;
        let location = [];
        location.push(name, lan[0], lan[1], xid);
        locations.push(location);
      }
      console.log(locations.length);
      markerFunc(locations);
    });
}

// add marker to all locations

function markerFunc(locations, xid) {
  for (let i = 0; i < locations.length; i++) {
    let latLng = new google.maps.LatLng(locations[i][2], locations[i][1]);

    let marker;
    marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: locations[i][0],
    });
    let id = locations[i][3];

    google.maps.event.addListener(
      marker,
      "click",
      (function (marker, i) {
        return function () {
          addInfo(id, marker,i);
          //infoWindow.setContent(locations[i][0]);
          //infoWindow.open(map, marker);
        };
      })(marker, i)
    );

    // calling api to get info content
    function addInfo(id) {
      //console.log(id);
      let url2 = `http://api.opentripmap.com/0.1/en/places/xid/${id}?apikey=${api_key}`;
      fetch(url2)
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log(data);
          console.log(data.point.lon, data.point.lat);
          address = data.address;
          const points = {
            lat: data.point.lat,
            lng: data.point.lon,
          };
          const contentString = `<div><h4>${data.name}</h4></div> 
            `;
          infoWindow = new google.maps.InfoWindow({
            content: contentString,
          });
          infoWindow.setPosition(points);
        });
    }
    // add infowindow
    google.maps.event.addListener(marker, "click", () => {
      infoWindow.open(map, marker);
    });
    marker.setMap(map);
  }
}
