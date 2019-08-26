// Select  USGS earthquake data set for the past 7 days
var quakeQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// URL for Tectonic_Plates GeoJSON data
var TectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL for Data
d3.json(quakeQueryUrl, function(data) {
  // send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
function createFeatures(earthquakeData) {  
  // Define a function to run once for each feature in the features array
  // Give each feature a popup describing the place, date/time and magnitude of the earthquake 
  var earthquakes = L.geoJSON(earthquakeData, {
    
    onEachFeature: function (feature, layer){
      layer.bindPopup(`<strong>Place:</strong> ${feature.properties.place}<br>
      <strong>Time:</strong> ${new Date(feature.properties.time)}<br>
      <strong>Magnitude:</strong> ${feature.properties.mag}`);
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          color: "#000",
          weight: .5,
          fillOpacity: .6,
          stroke: true
      })
    }
  });
  // Send earthquakes layer to the createMap function
  createMap(earthquakes); 
}

function createMap(earthquakes) {
  // Define satellite, greyscale and outdoor layers
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",  {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
  };

  // Create tectonicplates variable
  var tectonicplates = new L.LayerGroup();

  // Create overlay object to hold our overlay layers
  var overlayMaps = {
    Earthquakes: earthquakes,
    "TectonicPlates": tectonicplates
  };

  // Create our map, giving it the satellite, earthquakes and tectonicplates layers to display on load
  var myMap = L.map("map", {
    center: [40.5, -115.0],
    zoom: 2.5,
    layers: [satellite, earthquakes, tectonicplates]
  });
  
  // Get Tectonic Plate geoJSON data.
  d3.json(TectonicPlatesURL, function(tPlateData) {
    L.geoJson(tPlateData, {
      color: "orange",
      weight: 2
    })
    .addTo(tectonicplates);
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  

  // Create the legend 
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create('div', 'info legend');
      grades = [0, 1, 2, 3, 4, 5];
      labels = [];
     
      // loop through the density intervals to create labels and assign color for each interval   
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp;&nbsp;&nbsp;&nbsp;</i> ' +
            "<span style='color: gray'>" + (grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')) + "</span>";
      }
      return div;
    };
    // Adding legend to the map
    legend.addTo(myMap);
}

    function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    } 

// Define the color of the marker based on the magnitude of the earthquake.
function getColor(d) {
  switch (true) {
    case d > 5:
      return "#F30";
    case d > 4:
      return "#F60";
    case d > 3:
      return "#F90";
    case d> 2:
      return "#FC0";
    case d > 1:
      return "#FF0";
    default:
      return "#9F3";
    }
  }

//define the radius of the earthquake marker based on its magnitude (value).

function getRadius(value) {
  if (value === 0) {
    return 1;
  }
  return value * 41000;
}       


