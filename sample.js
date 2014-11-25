d3.json("smallReview.json", function(d) {
  mainvisdata = d
  // var stars = mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][0]["stars"]
  // var time = mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][0]["date"]
  // console.log(stars)
  // console.log(date)
  //plot by date -- sorting algorithm required? 
  //format: year-month-day (2013-05-14)
});

//date helper function
function getDate(d) {
	return new Date(d.jsonDate);
}

//get max and min dates -
var minDate = getDate(mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][0]["date"])
var maxDate = getDate(mainvisdata["vcNAWiLM4dR7D2nwwJ7nCA"][data.length-1]["date"])
   
    var margin = {top: 20, right: 15, bottom: 60, left: 60}
      , width = 960 - margin.left - margin.right
      , height = 500 - margin.top - margin.bottom;
    
    var x = d3.time.scale()
			  .domain([minDate, maxDate]).range([0, w]);
              .range([ 0, width ]);
    
    var y = d3.scale.linear()
    	      .domain([0, d3.max(data, function(d) { return d["vcNAWiLM4dR7D2nwwJ7nCA"][0]["date"]; })])
    	      .range([ height, 0 ]);
 
    var chart = d3.select('body')
	.append('svg:svg')
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart')

    var main = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main')   
        
    // draw the x axis
    var xAxis = d3.svg.axis()
	.scale(x)
	.orient('bottom');

    main.append('g')
	.attr('transform', 'translate(0,' + height + ')')
	.attr('class', 'main axis date')
	.call(xAxis);

    // draw the y axis
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient('left');

    main.append('g')
	.attr('transform', 'translate(0,0)')
	.attr('class', 'main axis date')
	.call(yAxis);

    var g = main.append("svg:g"); 
    
    g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) { return x(d["vcNAWiLM4dR7D2nwwJ7nCA"][0]["stars"]); } )
          .attr("cy", function (d) { return y(d["vcNAWiLM4dR7D2nwwJ7nCA"][0]["date"]); } )
          .attr("r", 5);