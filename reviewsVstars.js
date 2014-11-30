function sortByDate(reviews){
  return reviews.sort(function(a,b){
      return new Date(a.date) - new Date(b.date);
  });
};

d3.json("bizMadison.json", function(d) {
  bizData = d.filter(function(d){return d['categories'].indexOf("Pizza") != -1})

  bizData = bizData.sort(function(a,b){return a.review_count-b.review_count});

  var min = bizData[0].review_count;
  var max = bizData[bizData.length-1].review_count;

  //Set dimensions of canvas and graph
  var margin = {top: 40, right: 40, bottom: 40, left:40},
      width = 400,
      height = 400;

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

//Add the svg canvas
var svg = d3.select('body').append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  //Add the scatterplot
  svg.selectAll("dot")
      .data(bizData)
    .enter().append("circle")
      .attr("r", 2.5)
      .attr("cx", function(d) { return x(d.review_count); })
      .attr("cy", function(d) { return y(d.stars); });

  //Add the X axis
  svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
      .call(xAxis);

  //Add the Y axis
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

// Add an x-axis label.
svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Number of Reviews");

// Add a y-axis label.
svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Average Rating (Stars)");
});

