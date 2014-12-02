var intersection = function(array1, array2){
  return array1.filter(function(n) {
    return array2.indexOf(n) != -1
  });
}

var controls = d3.select("body").append("label")
        .attr("id", "controls");
var checkbox = controls.append("input")
        .attr("id", "collisiondetection")
        .attr("type", "checkbox");
    controls.append("span")
        .text("Collision detection");

var force;
var node;
var div;
var svg;

function smallMultiples(){
  myBus = document.getElementById("businessTags").value;
  myBus = "Slice-N-Bullits Bar & Grill" //testing - Jimmy
  if (! (myBus.indexOf(':') === -1)) { // handles duplicates
    myBus = myBus.substring(0, myBus.indexOf(":"));
  }
  myData = data.filter(function(d){return d.name == myBus})[0]
  myCats = myData.categories;
  allData = data.filter(function(d){return intersection(myCats, d.categories).length > 0});

//loopw
  myCats.forEach(function(cat){
    catData = allData.filter(function(d){return d.categories.indexOf(cat) != -1});
    var min = catData[0].review_count;
    var max = catData[catData.length-1].review_count;
    var xVar = "review_count",
        yVar = "stars";

    //set dimensions of canvas and graph
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
div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);


    //add the svg canvas 
svg = d3.select('body').append('svg')
            .attr('class', 'chart')
            .attr('width', width)
            .attr('height', height)
          .append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    // CECILE - add collision checkbox 

      // CECILE Force for dots
  force = d3.layout.force()
    .nodes(catData)
    .size([width, height])
    .on("tick", tick)
    .charge(-0.01)
    .gravity(0);

    x.domain(d3.extent(catData, function(d) { return d[xVar]; })).nice();
    y.domain(d3.extent(catData, function(d) { return d[yVar]; })).nice();

    // cecile Set initial positions
  catData.forEach(function(d) {
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

  node =  svg.selectAll("dot")
        .data(catData)
      .enter().append("circle")
        .attr("r", 2.5)
        .attr("cx", function(d) { return x(d[xVar]); })
        .attr("cy", function(d) { return y(d[yVar]); })
        .style("fill", function(d) {return d.business_id==myData.business_id?"red":"steelblue";})
        .style("opacity", function(d) {return d.business_id==myData.business_id?1:0.5;})
              .on("mouseover", function(d) {   
          div.transition()    
              .duration(200)    
              .style("opacity", .9);    
          div.html(d.name)  // tool tip message 
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
    var quadtree = d3.geom.quadtree(catData);
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
  setTimeout(function(){return 0}, 1000);

  });

}
