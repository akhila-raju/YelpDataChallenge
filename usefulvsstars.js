function sortByUseful(reviews){
  return reviews.sort(function(a,b){
      return a.votes.useful - b.votes.useful;
  });
};


d3.json("smallReview.json", function(d) {
  mainvisdata = d


var sortedData = sortByUseful(mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"]);

var minUseful = sortedData[0].votes.useful;
var maxUseful = sortedData[sortedData.length-1].votes.useful;

  //Set dimensions of canvas and graph
var margin = {top: 40, right: 40, bottom: 40, left:40},
    width = 600,
    height = 500;

//Set ranges
var x = d3.scale.linear()
    .domain([minUseful, maxUseful])
    .rangeRound([0, width - margin.left - margin.right]);

var y = d3.scale.linear()
    .domain([0, 5])
    .range([height - margin.top - margin.bottom, 0]);

//Define the axes
var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(maxUseful);
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
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
      .data(sortedData)
    .enter().append("circle")
      .attr("r", 3.5)
      .attr("cx", function(d) { return x(d.votes.useful); })
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
});

