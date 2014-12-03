//GOOGLE MAPS ELEMENTS 

//should change based on city
var center = new google.maps.LatLng(43.1035763, -89.3439745);

//Create the map
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 10,
  zoomControl: false,
  center: center,
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

//probably don't need this?
var marker = new google.maps.Marker({
  position: center,
  map: map,
  draggable:false
});

// Event Listeners
google.maps.event.addListener(marker, 'drag', updateRadius);
google.maps.event.addListener(map, 'zoom_changed', updateRadius);
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
var categoryList = []; 
var availableTags = [];
var nameWithAddress = ""; 
var duplicates = []; 
var seenSoFar; 
var nameCounts;
var myTitle; 
d3.json("bizMadison.json", function(d) {
 	//d here is the entire list of businesses
 	//bind it to the global variable...
 	data = d;
  radData = d;
  vizData = d;
  markerData = d;
  initAutoComplete();
 	initOverlay();
});

d3.json("madisonReviews.json", function(d){
  reviews = d;
})

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
  nameCounts = count(data, function(d){return d.name});
  uniqueNames = Object.keys(nameCounts);
  for (name in uniqueNames){
    if (nameCounts[uniqueNames[name]] > 1){
      duplicates.push(uniqueNames[name]);
    }
  }
  for (i in data){
    if (duplicates.indexOf(data[i].name) != -1){
      availableTags.push(data[i].name + ": " + data[i].full_address);
    } else{
      availableTags.push(data[i].name)
    }
  }
  $( "#businessTags" ).autocomplete({
      source: availableTags
    });
  //autocomplete for categories
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
}

// Overlay used for adding circles on google map element
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


function toggleAll(){
  //just testing
  console.log("hi");
}

// shows circles in radius defined by user
function updateRadius(){
  if (document.getElementById('vizradius').value.length != 0) {
    //Gets specified radius input from text
    distanceThreshold = document.getElementById('vizradius').value;
  } else {
    //Sets radius to 20 if radius isn't specified
    distanceThreshold = 20;
  }
  //Removes radius marker if greater than 20
  if (distanceThreshold >= 20) {
    useDistance = false;
  } else {
    useDistance = true;
  }
  distanceThresholdMeters = MILES_TO_METERS * distanceThreshold;
  radius.setVisible(useDistance);
  radius.setRadius(distanceThresholdMeters);
  //filter data by radius 
  radData = data.filter(function (d){return google.maps.geometry.spherical.computeDistanceBetween(marker.getPosition(), new google.maps.LatLng(d['latitude'], d['longitude'])) <= distanceThresholdMeters});
  //console.log(vizData.length);
  // Update Distance Radius
  updateCategory(myCat);
  update(radData);
   //this needs fixing
}
function update(d){
  if (!useDistance){
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

function updateCategory(cat){
  //myCat = document.getElementById("categoryTags").value;
  myCat = cat;
  if (myCat == 'All'){
    vizData = radData;
  } else{
   vizData = radData.filter(function (d){return d['categories'].indexOf(myCat) != -1})
}
  update(vizData)
}

var buttonNames;
var indivButtonNames;
var categorybuttons;
var indivButtons;
var menubuttons;
var menuNames;

// updates marker position after searching for business - Akhila
function updateMarker() {
  // show("no");
  showcheckbox("no");
  myBus = document.getElementById("businessTags").value;
  console.log(myBus)
  if (! (myBus.indexOf(':') === -1)) { // handles duplicates
    myBus = myBus.substring(0, myBus.indexOf(":"));
  }
  myData = markerData.filter(function(d){return d.name == myBus})[0]
  latitude = markerData.filter(function(d){return d.name == myBus})[0]['latitude']
  longitude = markerData.filter(function(d){return d.name == myBus})[0]['longitude']
  console.log (latitude, longitude)
  latlng = new google.maps.LatLng(latitude, longitude);
  marker.setPosition(latlng);
  updateRadius();
  update(radData);


  // My Viz buttons

//Choices for Individual
  vizbizdata = ["Useful", "Time", "Distribution"];

  indivButtons = d3.select("#individual").selectAll(".pure-button")
      .data(vizbizdata, function(d){return d;})    
  indivButtons.enter().append("input")
      .attr("type","button")
      .attr("class","pure-button")
      .attr("value", function (d){return d;})
      .on("click", function(d){
        vizCat(d);
      });
  indivButtons.exit().remove(); 


  // Categories for comparison
  buttonNames = myData.categories;
  categorybuttons = d3.select("#comparisonbuttons").selectAll(".pure-button")
      .data(buttonNames, function(d){return d;})    
  categorybuttons.enter().append("input")
      .attr("type","button")
      .attr("class","pure-button")
      .attr("value", function (d){return d;})
      .on("click", function(d){
        vizCat(d);
      });
  categorybuttons.exit().remove(); 

  d3.select("#vizSpace")
          .remove();
  starDistribution(myData.business_id);
}

//shows categories only if comparison button pressed
// function show(yesorno) {
//   if (yesorno == "yes") {
//     var newOpacity = 1;
//   } else {
//     var newOpacity = 0;
//   }
//   d3.select("#comparisonbuttons").style("opacity", newOpacity);
// }

function showcheckbox(yesorno) {
  if (yesorno == "yes") {
    var newOpacity = 1;
  } else {
    var newOpacity = 0;
  }
  d3.select("#collisionbox").style("opacity", newOpacity);
}

var first = true;
function vizCat(cat){
  myTitle = cat; 
  if (cat == "Distribution"){
    // d3.select("#collisionbox")
    //   .remove();
    var active = false;
    starDistribution(myData.business_id);
  } else if (cat == "Useful"){
    usefulVstars(myData.business_id);
  } else if (cat == "Time"){
    reviewsVtime(myData.business_id);
  }else {
    var active = true;
    updateCategory(cat);
    d3.select("#vizSpace")
      .remove();
    viz();
  }
  // checkbox
  var newOpacity = active ? 1 : 0;
  d3.select("#collisionbox").style("opacity", newOpacity);
}

var x;
var y;
var controls;
var checkbox;

// added from force.html -- Akhila
function viz(){
  if (first){
  first = false;
  controls = d3.select("#collisionbox").append("label")
    .attr("id", "controls");
  checkbox = controls.append("input")
    .attr("id", "collisiondetection")
    .attr("type", "checkbox");
  controls.append("span")
    .text("Unclutter dots");
  }
  d3.select("#vizSpace")
    .remove();
  
  bizData = vizData.slice(0);
  bizData = bizData.sort(function(a,b){return a.review_count-b.review_count});
  bizCounts = count(bizData, function(d){return d.stars})
  bizCounts = d3.entries(bizCounts);
  var total=0;
   for (var i=bizCounts.length; i--;) {
     total+=bizCounts[i].value;
   }
  bizCounts.forEach(function(d){
    d.key = +d.key;
    d.percentage = d.value / total;
  }) // keys are star values
  myStars = myData.stars;
  percentGreater = 0;
  for (var i = bizCounts.length; i--;){
    if (bizCounts[i].key >= myStars){
      percentGreater += bizCounts[i].percentage;
    }
  }

  var pg = percentGreater.toFixed(2)
  pg *= 100


  var myPg = 100 - pg; 
  d3.select("#statistics").selectAll("label").remove();
  textbox = d3.select("#statistics").append("label")
    .append("span")
    .text("This business has an average rating of " + myData.stars + " stars. " + myPg.toString() + " % of businesses in this category have an equal or lower rating. " )
    .style("left", 100+ "px");
  console.log(percentGreater);
  var min = bizData[0].review_count;
  var max = bizData[bizData.length-1].review_count;
  var xVar = "review_count",
      yVar = "stars";


  //Set dimensions of canvas and graph
var margin = {top: 30, right: 40, bottom: 40, left:40},
    width = 500,
    //cecile made a bit higher to fit the text
    height = 500,
    padding = 1, // separation between nodes
  radius = 4;

//Set ranges
x = d3.scale.linear()
    .domain([min, max])
    .rangeRound([0, width - margin.left - margin.right]);

y = d3.scale.linear()
    .domain([0.8, 5.2])
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
    .tickPadding(8);

// setup fill color
var cValue = function(d) { return d[yVar];};
var color = d3.scale.ordinal()
      .domain(["5", "4.5", "4", "3.5", "3", "2.5", "2", "1.5", "1"])
      .range(["#080226", "#120440", "#090161", "#074187" , "#056ba0", "#0495b8", "#02c0d1", "#01eaea", "#00fff7"]);


// Define the div for the tooltip
var div = d3.select("#charts").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

//Add the svg canvas
var svg = d3.select('#charts').append('svg')
    .attr('id', 'vizSpace')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  // Force for dots
  var force = d3.layout.force()
    .nodes(bizData)
    .size([width, height])
    .on("tick", tick)
    .charge(0.1)
    .gravity(0);

  x.domain(d3.extent(bizData, function(d) { return d[xVar]; })).nice();

  // Set initial positions
  bizData.forEach(function(d) {
    d.x = x(d[xVar]);
    d.y = y(d[yVar]);
    d.radius = radius;
  });
myName = document.getElementById('businessTags').value;
if (! (myName.indexOf(':') === -1)) { // handles duplicates
       myName = myName.substring(0, myBus.indexOf(":"));
      }
svg.append("text")
  .attr("x", width / 2)
  .attr("y", -10)
    .style("text-anchor", "middle")
    .text(myName + " and Businesses in "+ myTitle)
    .attr({ "font-size": 12, "font-family": "'Open Sans', sans-serif"});

    console.log(myTitle)



  //Add the X axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", 150)
      .attr("y", 20)
      //.style("text-anchor", "end")
      .text("Number Of Ratings")
      .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

  //Add the Y axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("dy", ".7em")
  .style("text-anchor", "end")
  .text("Average Rating")
  .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

  // Add dots
  var node = svg.selectAll(".dot")
      .data(bizData, function(d){return d;})
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", radius - .75)
      .attr("cx", function(d) { return x(d[xVar]); })
      .attr("cy", function(d) { return y(d[yVar]); })
      .style("fill", function(d) {return d.business_id==myData.business_id?"red": color(cValue(d));})
      // .style("fill", function(d) { return color(cValue(d));}) 
      // .style("opacity", function(d) {return d.business_id==myData.business_id?1:0.7;})
      .on("click", function(d){starDistribution(d.business_id);
        var active = false;
        var newOpacity = active ? 1 : 0;
        d3.select("#collisionbox").style("opacity", newOpacity);
      }) //make a graph
      .on("mouseover", function(d) {   
          div.transition()    
              .duration(200)    
              .style("opacity", 1);    
          div .html(d.name + ": " + d[xVar] + " reviews")  // tool tip message 
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
        })          
      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
      });

  d3.select("#collisiondetection").on("change", function() {
    force.resume();
  });

    force.start();

  function tick(e) {
    node.each(moveTowardDataPosition(e.alpha));

    if (checkbox.node().checked) node.each(collide(e.alpha));

    node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
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


function starDistribution(ID){
    d3.select("#vizSpace")
          .remove();

  var thisBiz = data.filter(function(d){return d.business_id == ID});
  bizReviews = reviews[ID]; // need to load reviews
  justStars = bizReviews.map(function(d){return d.stars;});

  starCounts = count(justStars);
  min = Math.min.apply(null, d3.entries(starCounts).map(function(d){return d.value}));
  max = Math.max.apply(null, d3.entries(starCounts).map(function(d){return d.value}));
  starArray = d3.entries(starCounts);

  var margin = {top: 30, right: 40, bottom: 40, left: 40},
    width = 420, //- margin.left - margin.right,
    height = 430;// - margin.top - margin.bottom;

  var xScale = d3.scale.ordinal()
                  .rangeRoundBands([0, width], .5);
  var yScale = d3.scale.linear()
                  .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom");
  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .ticks(max);

  var svg = d3.select("#charts").append("svg")
    .attr("id", "vizSpace")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  xScale.domain([1,2,3,4,5]);
  yScale.domain([0, d3.max(starArray, function(d){return d.value;})]);

svg.append("text")
  .attr("x", width / 2)
  //changed y to fit text
  .attr("y", -5)
    .style("text-anchor", "middle")
    .text("Number of Stars over Number of Reviews")
    .attr({ "font-size": 16, "font-family": "'Open Sans', sans-serif"});


svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis)
.append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", 12)
      .style("text-anchor", "end")
      .text("Stars")
      .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -35)
  .attr("dy", ".7em")
  .style("text-anchor", "end")
  .text("# Reviews")
  .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

svg.selectAll(".bar")
      .data(starArray)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("fill", "steelblue")
      .attr("x", function(d) { return xScale(+d.key); })
      .attr("width", xScale.rangeBand())
      .attr("y", function(d) { return yScale(d.value); })
      .attr("height", function(d) { return height - yScale(d.value); });

}

function sortByUseful(reviews){
  return reviews.sort(function(a,b){
      return a.votes.useful - b.votes.useful;
  });
};

function usefulVstars(ID){
  if (first){
  first = false;
  controls = d3.select("#collisionbox").append("label")
    .attr("id", "controls");
  checkbox = controls.append("input")
    .attr("id", "collisiondetection")
    .attr("type", "checkbox");
  controls.append("span")
    .text("Unclutter dots");
  }
  d3.select("#vizSpace")
          .remove();
  var sortedData = sortByUseful(reviews[ID]);
  var min = sortedData[0].votes.useful;
  var max= sortedData[sortedData.length-1].votes.useful;

    //Set dimensions of canvas and graph
  var margin = {top: 30, right: 40, bottom: 40, left:40},
      width = 500,
      //cecile made a bit higher to fit the text
      height = 500,
      padding = 1, // separation between nodes
    radius = 4;

  //Set ranges
  x = d3.scale.linear()
      .domain([min, max])
      .rangeRound([0, width - margin.left - margin.right]);

  y = d3.scale.linear()
      .domain([0.8, 5.2])
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
    .tickPadding(8);

// setup fill color
var cValue = function(d) { return d.stars;};
var color = d3.scale.ordinal()
      .domain(["5", "4.5", "4", "3.5", "3", "2.5", "2", "1.5", "1"])
      .range(["#080226", "#120440", "#090161", "#074187" , "#056ba0", "#0495b8", "#02c0d1", "#01eaea", "#00fff7"]);


// Define the div for the tooltip
var div = d3.select("#charts").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

//Add the svg canvas
var svg = d3.select('#charts').append('svg')
    .attr('id', 'vizSpace')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  // Force for dots
  var force = d3.layout.force()
    .nodes(sortedData)
    .size([width, height])
    .on("tick", tick)
    .charge(0.1)
    .gravity(0);

  x.domain(d3.extent(sortedData, function(d) { return d.votes.useful; })).nice();

  // Set initial positions
  sortedData.forEach(function(d) {
    d.x = x(d.votes.useful);
    d.y = y(d.stars);
    d.radius = radius;
  });

svg.append("text")
  .attr("x", width / 2)
  .attr("y", -10)
    .style("text-anchor", "middle")
    .text("Reviews by Usefulness")
    .attr({ "font-size": 16, "font-family": "'Open Sans', sans-serif"});

    console.log(myTitle)



  //Add the X axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", 150)
      .attr("y", 20)
      //.style("text-anchor", "end")
      .text("Number Of Useful Votes")
      .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

  //Add the Y axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("dy", ".7em")
  .style("text-anchor", "end")
  .text("Rating")
  .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

  // Add dots
  var node = svg.selectAll(".dot")
      .data(sortedData, function(d){return d;})
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", radius - .75)
      .attr("cx", function(d) { return x(d.votes.useful); })
      .attr("cy", function(d) { return y(d.stars); })
      .style("fill", function(d) {return color(cValue(d));})
      // .style("fill", function(d) { return color(cValue(d));}) 
      // .style("opacity", function(d) {return d.business_id==myData.business_id?1:0.7;})
      .on("click", function(d){starDistribution(d.business_id);
        var active = false;
        var newOpacity = active ? 1 : 0;
        d3.select("#collisionbox").style("opacity", newOpacity);
      }) //make a graph
      .on("mouseover", function(d) {   
          div.transition()    
              .duration(200)    
              .style("opacity", 1);    
          div .html("Useful Votes: " + d.votes.useful.toString())  // tool tip message 
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
        })          
      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
      });

  d3.select("#collisiondetection").on("change", function() {
    force.resume();
  });

    force.start();

  function tick(e) {
    node.each(moveTowardDataPosition(e.alpha));

    if (checkbox.node().checked) node.each(collide(e.alpha));

    node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
  }

  function moveTowardDataPosition(alpha) {
    return function(d) {
      d.x += (x(d.votes.useful) - d.x) * 0.1 * alpha;
      d.y += (y(d.stars) - d.y) * 0.1 * alpha;
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(sortedData);
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

function sortByDate(reviews){
  return reviews.sort(function(a,b){
      return new Date(a.date) - new Date(b.date);
  });
};

function reviewsVtime(ID){
  if (first){
  first = false;
  controls = d3.select("#collisionbox").append("label")
    .attr("id", "controls");
  checkbox = controls.append("input")
    .attr("id", "collisiondetection")
    .attr("type", "checkbox");
  controls.append("span")
    .text("Unclutter dots");
  }
  d3.select("#vizSpace")
          .remove();
  var parseDate = d3.time.format("%Y-%m-%d").parse;
  var sortedData = sortByDate(reviews[ID]);
  var minDate = parseDate(sortedData[0].date);
  var maxDate = parseDate(sortedData[sortedData.length-1].date);

    //Set dimensions of canvas and graph
  var margin = {top: 30, right: 40, bottom: 40, left:40},
      width = 500,
      //cecile made a bit higher to fit the text
      height = 500,
      padding = 1, // separation between nodes
    radius = 4;

  //Set ranges
 var x = d3.time.scale()
    .domain([minDate, d3.time.day.offset(maxDate, 1)])
    .rangeRound([0, width - margin.left - margin.right]);

  var y = d3.scale.linear()
      .domain([0.8, 5.2])
      .range([height - margin.top - margin.bottom, 0]);

//Define the axes
var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(d3.time.days, 1)
    .tickFormat(d3.time.format('%b %e %Y'))
    .tickValues(x.domain())
    .tickSize(0)
    .tickPadding(8);
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickPadding(8)
    .ticks(5);

// setup fill color
var cValue = function(d) { return d.stars;};
var color = d3.scale.ordinal()
      .domain(["5", "4.5", "4", "3.5", "3", "2.5", "2", "1.5", "1"])
      .range(["#080226", "#120440", "#090161", "#074187" , "#056ba0", "#0495b8", "#02c0d1", "#01eaea", "#00fff7"]);


// Define the div for the tooltip
var div = d3.select("#charts").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

//Add the svg canvas
var svg = d3.select('#charts').append('svg')
    .attr('id', 'vizSpace')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  // Force for dots
  var force = d3.layout.force()
    .nodes(sortedData)
    .size([width, height])
    .on("tick", tick)
    .charge(0.1)
    .gravity(0);

  // Set initial positions
  sortedData.forEach(function(d) {
    d.x = x(parseDate(d.date));
    d.y = y(d.stars);
    d.radius = radius;
  });

svg.append("text")
  .attr("x", width / 2)
  .attr("y", -10)
    .style("text-anchor", "middle")
    .text("Reviews over Time")
    .attr({ "font-size": 16, "font-family": "'Open Sans', sans-serif"});

    console.log(myTitle)



  //Add the X axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", 150)
      .attr("y", 20)
      //.style("text-anchor", "end")
      .text("Date")
      .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

  //Add the Y axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("dy", ".7em")
  .style("text-anchor", "end")
  .text("Rating")
  .attr({ "font-size": 10, "font-family": "'Open Sans', sans-serif"});

  // Add dots
  var node = svg.selectAll(".dot")
      .data(sortedData, function(d){return d;})
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", radius - .75)
      .attr("cx", function(d) { return x(parseDate(d.date)); })
      .attr("cy", function(d) { return y(d.stars);})
      .style("fill", function(d) {return color(cValue(d));})
      // .style("fill", function(d) { return color(cValue(d));}) 
      // .style("opacity", function(d) {return d.business_id==myData.business_id?1:0.7;})
      .on("click", function(d){starDistribution(d.business_id);
        var active = false;
        var newOpacity = active ? 1 : 0;
        d3.select("#collisionbox").style("opacity", newOpacity);
      }) //make a graph
      .on("mouseover", function(d) {   
          div.transition()    
              .duration(200)    
              .style("opacity", 1);    
          div .html(d.date)  // tool tip message 
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
        })          
      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
      });

  d3.select("#collisiondetection").on("change", function() {
    force.resume();
  });

    force.start();

  function tick(e) {
    node.each(moveTowardDataPosition(e.alpha));

    if (checkbox.node().checked) node.each(collide(e.alpha));

    node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
  }

  function moveTowardDataPosition(alpha) {
    return function(d) {
      d.x += (x(parseDate(d.date)) - d.x) * 0.1 * alpha;
      d.y += (y(d.stars) - d.y) * 0.1 * alpha;
    };
  }

  // Resolve collisions between nodes.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(sortedData);
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
