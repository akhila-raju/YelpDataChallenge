// d3.json("smallReview.json", function(d) {
//   mainvisdata = d
//   // var stars = mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][0]["stars"]
//   // var time = mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][0]["date"]
//   // console.log(stars)
//   // console.log(date)
//   //plot by date -- sorting algorithm required? 
//   //format: year-month-day (2013-05-14)
// });

// //date helper function
// function getDate(d) {
// 	return new Date(d.jsonDate);
// }

//get max and min dates -
// var minDate = getDate(mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][0]["date"])
// var maxDate = getDate(mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][data.length-1]["date"])

var data = [{"date":"2012-03-20","total":3},{"date":"2012-03-21","total":2},{"date":"2012-03-22","total":4},{"date":"2012-03-23","total":5},{"date":"2012-03-24","total":3},{"date":"2012-03-25","total":4},{"date":"2012-03-26","total":1}];

var margin = {top: 40, right: 40, bottom: 40, left:40},
    width = 600,
    height = 500;

var x = d3.time.scale()
    .domain([new Date(data[0].date), d3.time.day.offset(new Date(data[data.length - 1].date), 1)])
    .rangeRound([0, width - margin.left - margin.right]);

var y = d3.scale.linear()
    .domain([0, 5])
    .range([height - margin.top - margin.bottom, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .ticks(d3.time.days, 1)
    .tickFormat(d3.time.format('%b %e %Y'))
    .tickSize(0)
    .tickPadding(8);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickPadding(8)
    .ticks(5);

//Add svg canvas
var svg = d3.select('body').append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

//Parse data
var parseDate = d3.time.format("%Y-%m-%d").parse;

//Add the scatterplot
svg.selectAll("dot")
    .data(data)
  .enter().append("circle")
    .attr("r", 3.5)
    .attr("cx", function(d) { return x(parseDate(d.date)); })
    .attr("cy", function(d) { return y(d.total); });

//Add the X axis
svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
    .call(xAxis);

//Add the Y axis
svg.append('g')
  .attr('class', 'y axis')
  .call(yAxis);