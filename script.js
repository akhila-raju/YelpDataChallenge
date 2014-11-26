//GOOGLE MAPS ELEMENTS 

//should change based on city
var center = new google.maps.LatLng(43.1035763, -89.3439745);

//Create the map
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 10,
  center: center,
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

//probably don't need this?
var marker = new google.maps.Marker({
  position: center,
  map: map,
  draggable:true
});

// Event Listeners
google.maps.event.addListener(marker, 'drag', updateMap);
$('body').on("click", "input[type=checkbox]", updateMap);

// google.maps.event.addListener(marker, 'dragend', function (event) {
//     var myLat = event.latLng.lat();
//     var myLong = event.latLng.lng();
//     center = marker.getPosition();
//     map.setCenter(center);
//     updateMap();
// });

//initialize radius
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

var data;
var myCat = 'all';
var MILES_TO_METERS = 1609.34;
var resolutionVal; // what does this do 
var markerPos;
var useDistance;
var distanceThreshold = 12;
var distanceThresholdMeters;
var layer;
var padding;
var projection;
var radData;

d3.json("bizMadison.json", function(d) {
 	//d here is the entire list of businesses
 	//bind it to the global variable...
 	data = d;

  $(function() {
    var availableTags = [data[0].name];
    $( "#tags" ).autocomplete({
      source: availableTags
    });
  });


  radData = data;
 	var overlay = new google.maps.OverlayView();
 	 // Add the container when the overlay is added to the map.
  	overlay.onAdd = function() {
    layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "stations");
   
    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      projection = this.getProjection(),
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
      }
 };
 	overlay.setMap(map);
 });

function transform(d) {
        d = new google.maps.LatLng(d.value['latitude'], d.value['longitude']);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
}

$(function() {
    $( "#radiusSlider" ).slider({
      //range: true,
      min:  0.5,
      max: 12,
      value: 12,
      step: .5, //steps every 0.5 miles
      slide: function( event, ui ) {
        distanceThreshold = ui.value;
        $("#useDistanceCheckbox").prop("checked", false)
        updateMap()
      }
    });
  });

function toggleAll(){
  console.log("hi");
}

function updateMap(){
  distanceThresholdMeters = MILES_TO_METERS * distanceThreshold;
  useDistance = ! $("#useDistanceCheckbox").prop("checked");
  //filter data by radius 
  radData = data.filter(function (d){return useDistance && google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), new google.maps.LatLng(d['latitude'], d['longitude'])) <= distanceThresholdMeters});
  radius.setVisible(useDistance);
  radius.setRadius(distanceThresholdMeters);
  //console.log(vizData.length);
  $("#distanceString").text((useDistance ? distanceThreshold : "--") + " Miles")
  // Update Distance Radius
  var circles = layer.selectAll("svg")
                //bind radius data - how to maintain category?
                .data(d3.entries(radData))
                .each(transform);

  circles.exit().remove();
      // Add a circle.
  circles.enter().append("svg:svg")
        .each(transform)
        .append("svg:circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);
  updateCategory(myCat);
}

function updateCategory(cat){
  myCat = cat;
  if (cat == 'all'){
    vizData = radData;
  } else{
   vizData = radData.filter(function (d){return d['categories'].indexOf(cat) != -1})
}
  var circles = layer.selectAll("svg")
                .data(d3.entries(vizData))
                .each(transform);

  circles.exit().remove();
      // Add a circle.
  circles.enter().append("svg:svg")
        .each(transform)
        .append("svg:circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);
}


