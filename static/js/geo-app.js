$.ajax({
    url : '/bubble_data',
    type : 'GET',
    dataType:'json',
    success : function(data) {
        var json = {'children': data}
        constructBubble(json);
    },
    error : function(request,error) {
        console.log("Request: "+JSON.stringify(request));
    }
});

var constructBubble = function(json) {
    var diameter = 1000,
        color = d3.scaleOrdinal(d3.schemeCategory20c);

    var colorScale = d3.scaleLinear()
      .domain([0, d3.max(json.children, function(d) {
        return d.value;
      })])
      .range(["rgb(46, 73, 123)", "rgb(71, 187, 94)"]);

    var bubble = d3.pack()
      .size([diameter, diameter])
      .padding(5);

    var margin = {
      left: 0,
      right: 10,
      top: 0,
      bottom: 0
    }

    var svg = d3.select('#bubbleChart').append('svg')
      .attr('viewBox','0 0 ' + (diameter + margin.right) + ' ' + diameter)
      .attr('width', (diameter + margin.right))
      .attr('height', diameter)
      .attr('class', 'chart-svg');

    var root = d3.hierarchy(json)
      .sum(function(d) { return d.value; })
      .sort(function(a, b) { return b.value - a.value; });

    bubble(root);

    var node = svg.selectAll('.node')
      .data(root.children)
      .enter()
      .append('g').attr('class', 'node')
      .attr('transform', function(d) { return 'translate(' + d.x + ' ' + d.y + ')'; })
      .append('g').attr('class', 'graph');

    node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) {
        return color(d.data.name);
      })

    node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("color", "black")
      .text(function(d) { return d.data.name; })
    //  .style("fill", "#ffffff");

     var bubble_tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function(d) {
            return "<strong>" +d.data.name + ":</strong> <span class='tooltip-value'>" + d.value;
     });

     d3.selectAll(".node")
        .call(bubble_tooltip)
        .on('mouseover', bubble_tooltip.show)
        .on('mouseout', bubble_tooltip.hide);
}

