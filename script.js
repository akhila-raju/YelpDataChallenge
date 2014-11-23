//GOOGLE MAPS ELEMENTS 

var center = new google.maps.LatLng(43.1035763, -89.3439745);
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 11,
  center: center,
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

var marker = new google.maps.Marker({
  position: center,
  map: map,
  draggable:true
});

//RADIUS OF THE MAP 
var radius = new google.maps.Circle({
  map: map,
  strokeWeight: 1,
  strokeColor: "#ff0000",
  fillOpacity: 0.1,
  fillColor: "#ff0000",
  strokeColor: "#ff0000",
  radius: 1500
        });
  radius.bindTo('center', marker, 'position');

var data; // exposed data

// Load the station data. When the data comes back, create an overlay.
d3.json("bizMadison.json", function(d) {
  data = d
  var overlay = new google.maps.OverlayView();

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "stations");

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;

      var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
        .enter().append("svg:svg")
          .each(transform)
          .attr("class", "marker");

      // Add a circle.
      marker.append("svg:circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);

      // Add a label.
      // marker.append("svg:text")
      //     .attr("x", padding + 7)
      //     .attr("y", padding)
      //     .attr("dy", ".31em")
      //     .text(function(d) { return d.key; });

      function transform(d) {
        if (d.key == '0'){
          console.log(d);
        }
         d = new google.maps.LatLng(d.value['latitude'], d.value['longitude']);
         d = projection.fromLatLngToDivPixel(d);
         return d3.select(this)
             .style("left", (d.x - padding) + "px")
             .style("top", (d.y - padding) + "px");
      }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);
});

// Data Variables
var categories = []
// In the future, this could probably be dynamically computed.
//var otherCategories = ["Other offenses", "Family offenses", "Embezzlement", "Prostitution", "Runaway", "Sex offenses, non forcible", "Stolen property", "Loitering", "Liquor laws", "Suicide", "Forgery/counterfeiting", "Disorderly conduct",  "Arson", "Suspicious occ" ]
var resolutions = []
//var minLat = 90, minLon = 180, maxLat = -90, maxLon = -180;

    //CB changed radiusSlider to be one-sided 
  $(function() {
    $( "#radiusSlider" ).slider({
      //range: true,
      min:  0,
      max: 12,
      value: 12,
      slide: function( event, ui ) {
        distanceThreshold = ui.value;
        $("#useDistanceCheckbox").prop("checked", false)
        updateFilter()
      }
    });
  });




// Filter Functions and Variables
var MILES_TO_METERS = 1609.34
var resolutionVal; // what does this do 
var checkedCategories;
var markerPos;
var useDistance;
var distanceThreshold = 12;
var distanceThresholdMeters;


function filter(d) {  
  if (useDistance && google.maps.geometry.spherical.computeDistanceBetween(markerPos, new google.maps.LatLng(d.value['latitude'], d.value['longitude'])) > distanceThresholdMeters) {
    return "none"
  }
  return "initial";
}

function updateFilter() {
  var incidents = d3.select('.stations').selectAll("svg").data(d3.entries(data))

  markerPos = marker.getPosition()
  distanceThresholdMeters = MILES_TO_METERS * distanceThreshold;
  useDistance = ! $("#useDistanceCheckbox").prop("checked")

  $("#distanceString").text((useDistance ? distanceThreshold : "--") + " Miles")
  // Update Distance Radius
  radius.setVisible(useDistance)
  radius.setRadius(distanceThresholdMeters)
  // Perform Filter
  incidents.style("display", filter)
}

google.maps.event.addListener(marker, 'drag', updateFilter);

// Initialize
updateFilter()






