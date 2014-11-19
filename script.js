var center = new google.maps.LatLng(43.1035763, -89.3439745);
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 12,
  center: center,
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

var marker = new google.maps.Marker({
  position: center,
  map: map,
  draggable:true
});

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


// Load the station data. When the data comes back, create an overlay.
d3.json("all.json", function(data) {
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
        console.log(d);
        d = new google.maps.LatLng(d.value[0], d.value[1]);
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

  $(function() {
    $( "#kills" ).slider({
      range: true,
      min:  0,
      max: maxKills,
      values: [ 0, maxKills ],
      slide: function( event, ui ) {
        $( "#killamount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
        filterData("kills", ui.values);
      }
    });
    $( "#killamount" ).val( $( "#kills" ).slider( "values", 0 ) +
      " - " + $( "#kills" ).slider( "values", 1 ) );
  });