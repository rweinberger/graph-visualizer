$( document ).ready(function() {

  var svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

  d3.select("input[type=range]")
      .on("input", inputted);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

  var graphName = $("#name").attr("name");

  d3.json("/json?name=" + graphName, function(error, graph) {
    if (error) throw error;
    var link = svg.append("g")
        .attr("class", "links")
      .selectAll("line")
      .data(graph[0].edges)
      .enter().append("line");

    var node = svg.append("g")
        .attr("class", "nodes")
      .selectAll("circle")
      .data(graph[0].nodes)
      .enter().append("circle")
        .attr("r", 2.5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(graph[0].nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph[0].edges);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }
  });

  function inputted() {
    console.log(this.value);
    simulation.force("link").strength(+(1-this.value));
    simulation.alpha(1).restart();
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

});