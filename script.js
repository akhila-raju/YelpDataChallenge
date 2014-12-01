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
 });

radius.bindTo('center', marker, 'position');

var data;
var myCat = 'all';
var MILES_TO_METERS = 1609.34;
var resolutionVal; // what does this do 
var markerPos; // this isn't used anywhere
var useDistance;
var distanceThreshold = 12;
var distanceThresholdMeters;
var layer;
var padding;
var projection;
var radData;
var markerData;
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
  markerData = d;
  initAutoComplete();
 	initOverlay();
  initSlider();
});

count = function(ary, classifier) {
    return ary.reduce(function(counter, item) {
        var p = (classifier || String)(item);
        counter[p] = counter.hasOwnProperty(p) ? counter[p] + 1 : 1;
        return counter;
    }, {})
}

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

    $( "#businessTags" ).autocomplete({
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
        .attr("r", 2)
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
  $("#distanceString").text((useDistance ? distanceThreshold : "12") + " Miles")
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
          .attr("r", 2)
          .attr("cx", padding)
          .attr("cy", padding);
}

  radius.setVisible(useDistance); // is this line supposed to be here? - Akhila

//this doesn't filter - Akhila - fixed
function updateCategory(){
  myCat = document.getElementById("categoryTags").value;
  if (myCat == 'All'){
    vizData = radData;
  } else{
   vizData = radData.filter(function (d){return d['categories'].indexOf(myCat) != -1})
}
  update(vizData)
}

// updates marker position after searching for business - Akhila
function updateMarker() {
  myBus = document.getElementById("businessTags").value;
  console.log(myBus)
  if (! (myBus.indexOf(':') === -1)) { // handles duplicates
    myBus = myBus.substring(0, myBus.indexOf(":"));
  }
  latitude = markerData.filter(function(d){return d.name == myBus})[0]['latitude']
  longitude = markerData.filter(function(d){return d.name == myBus})[0]['longitude']
  console.log (latitude, longitude)
  latlng = new google.maps.LatLng(latitude, longitude);
  marker.setPosition(latlng);
  update(markerData)
  updateRadius()
  update(radData);
}


function viz(cat){
  bizData = data.filter(function(d){return d['categories'].indexOf(cat) != -1})

  bizData = bizData.sort(function(a,b){return a.review_count-b.review_count});

  var min = bizData[0].review_count;
  var max = bizData[bizData.length-1].review_count;
  var xVar = "review_count",
      yVar = "stars";

  //Set dimensions of canvas and graph
  var margin = {top: 40, right: 40, bottom: 40, left:40},
      width = 400,
      height = 400,
      padding = 1, // separation between nodes
    radius = 4;


//Set ranges
var x = d3.scale.linear()
    .domain([min, max])
    .rangeRound([0, width - margin.left - margin.right]);

var y = d3.scale.linear()
    .domain([1, 5])
    .range([height - margin.top - margin.bottom, 0]);

//Define the axes
var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickValues(x.domain())
    .tickSize(0)
    .tickPadding(8);
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickPadding(8)
    .ticks(5);

      // Define the div for the tooltip
      var div = d3.select("body").append("div") 
          .attr("class", "tooltip")       
          .style("opacity", 0);


//Add the svg canvas
var svg = d3.select('body').append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

var controls = d3.select("body").append("label")
    .attr("id", "controls");
var checkbox = controls.append("input")
    .attr("id", "collisiondetection")
    .attr("type", "checkbox");
controls.append("span")
    .text("Collision detection");



  var force = d3.layout.force()
    .nodes(bizData)
    .size([width, height])
    .on("tick", tick)
    .charge(-1)
    .gravity(0);
    // .chargeDistance(1); throwing an error

  x.domain(d3.extent(bizData, function(d) { return d[xVar]; })).nice();
  y.domain(d3.extent(bizData, function(d) { return d[yVar]; })).nice();

  // Set initial positions
  bizData.forEach(function(d) {
    d.x = x(d[xVar]);
    d.y = y(d[yVar]);
    // d.color = color(d.species);
    d.radius = radius;
  });

  //Add the X axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
      .call(xAxis);

  //Add the Y axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  var node = svg.selectAll(".dot")
      .data(bizData)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", radius)
      .attr("cx", function(d) { return x(d[xVar]); })
      .attr("cy", function(d) { return y(d[yVar]); })
      .on("mouseover", function(d) {   
                        div.transition()    
                            .duration(200)    
                            .style("opacity", .9);    
                        div .html("[" + d[0] + ", "  + d[1] + "]")  // tool tip message 
                            .style("left", (d3.event.pageX) + "px")   
                            .style("top", (d3.event.pageY - 28) + "px");  
                        })          
                    .on("mouseout", function(d) {   
                        div.transition()    
                            .duration(500)    
                            .style("opacity", 0); 
                    });

  // var legend = svg.selectAll(".legend")
  //     .data(color.domain())
  //   .enter().append("g")
  //     .attr("class", "legend")
  //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // legend.append("rect")
  //     .attr("x", width - 18)
  //     .attr("width", 18)
  //     .attr("height", 18)
  //     .style("fill", color);

  // legend.append("text")
  //     .attr("x", width - 24)
  //     .attr("y", 9)
  //     .attr("dy", ".35em")
  //     .style("text-anchor", "end")
  //     .text(function(d) { return d; });

  d3.select("#collisiondetection").on("change", function() {
    force.resume();
  });

    force.start();

  function tick(e) {
    node.each(moveTowardDataPosition(e.alpha));

    if (checkbox.node().checked) node.each(collide(e.alpha));

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }

  function moveTowardDataPosition(alpha) {
    return function(d) {
      d.x += (x(d[xVar]) - d.x) * 0.1 * alpha;
      d.y += (y(d[yVar]) - d.y) * 0.1 * alpha;
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(bizData);
    return function(d) {
      var r = d.radius + radius + padding,
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y);
              // r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

}