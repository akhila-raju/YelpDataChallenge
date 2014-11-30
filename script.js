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
google.maps.event.addListener(marker, 'drag', updateRadius);
google.maps.event.addListener(map, 'zoom_changed', updateRadius);
$('body').on("click", "input[type=checkbox]", updateRadius);

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
var categoryList; 
var availableTags;
var nameWithAddress = ""; 
var duplicates; 
var seenSoFar; 


d3.json("bizMadison.json", function(d) {
 	//d here is the entire list of businesses
 	//bind it to the global variable...
 	data = d;
  radData = d;
  initAutoComplete();
 	initOverlay();
  initSlider();
});

// INIT FUNCTIONS FOR MAP
function initAutoComplete(){
   //autocomplete for business names 
  $(function() {
    availableTags = [];
    seenSoFar = []; 
    duplicates = []; 
    for (var i=0; i < data.length; i++) {
      // go through each element and add to seenSoFar . if it hasn't been seen, add it . 
      //if it has been seen, add name to duplicates
      if($.inArray(data[i].name, seenSoFar) == -1){
          seenSoFar.push(data[i].name);
      }else{
        nameWithAddress = data[i].name + ": " + data[i].full_address;
        duplicates.push(data[i].name);
        availableTags.push(nameWithAddress);
      }
    }

    for (var i=0; i < data.length; i++) {
      if($.inArray(data[i].name, duplicates) == -1){
        availableTags.push(data[i].name);
      }
    }

    $( "#tags" ).autocomplete({
      source: availableTags
    });

    //autocomplete for categories 
    $(function() {
    categoryList = [];
    for (var i=0; i < data.length; i++) {
      for (var j=0; j < data[i].categories.length; j++) {
        if ($.inArray(data[i].categories[j], categoryList) == -1){
          categoryList.push(data[i].categories[j]);
        }
      }
    }
    $( "#categoryTags" ).autocomplete({
      source: categoryList
     });// end autocomplete categories 
    });// end autocomplete business 
  });// end D3 data load 
}

function initOverlay(){
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
}

function transform(d) {
  d = new google.maps.LatLng(d.value['latitude'], d.value['longitude']);
  d = projection.fromLatLngToDivPixel(d);
  return d3.select(this)
    .style("left", (d.x - padding) + "px")
    .style("top", (d.y - padding) + "px");
}

function initSlider(){

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
          updateRadius()
        }
      });
  });
}


function toggleAll(){
  //just testing
  console.log("hi");
}

function updateRadius(){
  distanceThresholdMeters = MILES_TO_METERS * distanceThreshold;
  useDistance = ! $("#useDistanceCheckbox").prop("checked");
  radius.setVisible(useDistance);
  radius.setRadius(distanceThresholdMeters);
  //filter data by radius 
  radData = data.filter(function (d){return useDistance && google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), new google.maps.LatLng(d['latitude'], d['longitude'])) <= distanceThresholdMeters});
  //console.log(vizData.length);
  $("#distanceString").text((useDistance ? distanceThreshold : "--") + " Miles")
  // Update Distance Radius
  update(radData);
  updateCategory(myCat); //this needs fixing
}

function update(d){
  if (d == false){
    d = data;
  }
  //updates circles on map to match data argument
  var circles = layer.selectAll("svg")
                //bind radius data - how to maintain category?
                .data(d3.entries(d))
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

  radius.setVisible(useDistance); // is this line supposed to be here? - Akhila

function updateCategory(category){
  myCat = category;
  if (myCat == 'all'){
    vizData = radData;
  } else{
   vizData = radData.filter(function (d){return d['categories'].indexOf(myCat) != -1})
}
  update(vizData)
}
