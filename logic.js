//Define url
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Define choosecolor function
function chooseColor (mag) {
  var x = d3.scaleLinear()
    .domain([0,5])
    .range(["lightyellow", "orange", "darkred"]);
  return x(mag)
};


// Grab data
d3.json(url, function(data) {

    // Call createFeatures function defined below
    createFeatures(data.features);
  });

// Define createFeatures function
function createFeatures (earthquakeData) {
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng){
      return L.circleMarker (latlng);
    },

    //Change marker style based on earthquake parameters
    style: function(feature) {
      return {
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        fillOpacity: 0.8,
        radius: feature.properties.mag*3
      };
    },

    //Bind some infos
    onEachFeature: function(feature, layer){
      layer.bindPopup("<h3>" + feature.properties.place +"</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  });

    // Call createMap function defined below
    createMap(earthquakes);
  };

  //Define createMap function
  function createMap(earthquakes) {

    // Define layers
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
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

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Grayscale": grayscale,
      "Satellite": satellite
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
    };
  
    // Create map, plus default layers
    var map = L.map("map", {
      center: [27.66, -81.52],
      zoom: 4,
      layers: [grayscale, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    //Attempt to make color legend
    //position legend
    var legend = L.control({position: 'bottomright'});

    //Define labels and colors
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend'),
        mags = [0, 1, 2, 3, 4, 5],
        labels = [];
      for (var i = 0; i < mags.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(mags[i] + 1) + '"></i> ' +
            mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
      return div;
    };

    //Add to map
    legend.addTo(map);
  };