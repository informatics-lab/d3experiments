var hadcrut = [];

loadData = function(){
  d3.text("data/HadCRUT.4.4.0.0.annual_ns_avg.txt", function(error, text) {
    var rows = d3.tsv.parseRows(text)
    rows.forEach(function(row){ 
        var els = row[0].split(/\s+/);

        var members = [];
        for (var i=2; i < els.length; i++){
            members.push(parseFloat(els[i]));
        }

        hadcrut.push({"year": parseInt(els[0]), 
                      "temp": parseFloat(els[1]), 
                      "members": members});
    })

    horizBarChart(hadcrut);
  });
};


horizBarChart = function(allData){
    var data = allData;
    var members = [];
    var w = 500;
    var h = 700;
    var barPadding = 0.5;

    var barHeight = (h / data.length) * (1.0-barPadding);

    var svg = d3.select("body")
                .append("svg")
                    .attr("width", w)
                    .attr("height", h);

    var chronologicalOrder = function(a, b) {return a.year - b.year;}
    var temperatureOrder = function(a, b) {return a.temp - b.temp;}

    d3.select("body")
      .append("label")
        .attr("id", "sort")
        .html("<input id=sortCheck type=checkbox> sort years")
      .on("change", function(){
            var order = d3.select("#sortCheck").property("checked") ? temperatureOrder : chronologicalOrder;
           update(data.sort(order));
           updateEnsMembers([], d, 0);
      })

    d3.select("#filterData")
        .on("click", function(d) {
            var minTemp = d3.select("#minTemp").property("value");
            var maxTemp = d3.select("#maxTemp").property("value");
            data = allData.filter(function(d){return d.temp >= minTemp && d.temp < maxTemp});
            var order = d3.select("#sortCheck").property("checked") ? temperatureOrder : chronologicalOrder;
            update(data.sort(order));
            updateEnsMembers([], d, 0);
         })

    var barLength = d3.scale.linear()
                    .domain([-d3.max(data, function(d){return Math.abs(d.temp);}),
                              d3.max(data, function(d){return Math.abs(d.temp);})])
                    .range([-w/2, w/2]);
    var dotScale = d3.scale.linear()
                    .domain([-d3.max(data, function(d){return Math.abs(d.temp);}),
                              d3.max(data, function(d){return Math.abs(d.temp);})])
                    .range([0, w]);
    var colorIntensity = d3.scale.linear()
                           .domain([0, d3.max(data, function(d){return Math.abs(d.temp);})])
                           .range([0, 255]);
    var barOrder = d3.scale.ordinal()
                           .domain(d3.range(data.length))
                           .rangeRoundBands([0, h], barPadding)
    
    var tooltip = d3.select("body")
                    .append("div")  // declare the tooltip div 
                    .attr("class", "tooltip") // apply the 'tooltip' class
                    .style("opacity", 0);

    function update(data) {
        var bar = svg.selectAll(".bar").data(data, function(d){return d.year})
      
        bar.exit()
            .transition()
                .duration(1000)
                .attr("width", 0)
                .attr("x", function(d) {return w / 2;})
            .remove()

        bar.transition()
                .delay(function(d, i) { return 500 + i * 400 / data.length; })
                .duration(500)
                .attr("y", function(d, i){ return barOrder(i) })

        bar.enter()
            .append("rect")
                .attr("class", "bar")
                .attr("y", function(d, i){ return barOrder(i) })
                .attr("height", barHeight)
                .attr("width", 0)
                .attr("x", function(d) {return w / 2;})
                    .transition()
                        .delay(function(d, i) { return 1000 + i * 400 / data.length; })
                        .duration(500)
                        .attr("width", function(d) { return Math.abs(barLength(d.temp)); })
                        .attr("x", function(d) {return w / 2 + Math.min(0.0, barLength(d.temp));})
                .attr("fill", function(d) {
                    var rgbstr = ""
                    if (d.temp <= 0.0){
                        rgbstr = "rgb(0, 0, "+ Math.round(colorIntensity(Math.abs(d.temp))) +")";
                    }else{
                        rgbstr = "rgb("+ Math.round(colorIntensity(Math.abs(d.temp))) +", 0, 0)";
                    }
                    return rgbstr
                });

        bar.on("mouseover", function(d){
                    tooltip.transition()
                                .duration(500)
                                .style("opacity", 0.9)
                    tooltip.html(d.year + "<br />" + d.temp + " &deg;C")
                            .style("left", (d3.event.pageX) + "px")          
                            .style("top", (d3.event.pageY - 28) + "px");
                })
            .on("mouseout", function(d){
                    tooltip.transition()
                                .duration(500)
                                .style("opacity", 0.0)
                })
            .on("click", function(d, i){
                    console.log('click');
                    updateEnsMembers(d.members, d, i);
                })
        


    }

    function updateEnsMembers(m, d, i) {
        var lineFunction = d3.svg.line()
                 .x(function(d) { return d.x; })
                 .y(function(d) { return d.y; })
                 .interpolate("linear");

        var lines = svg.selectAll("path").data(m);
        lines.enter()
            .append("path");

        lines
            .attr("d", function(e, j) { return lineFunction([ { "x": dotScale(d.temp),
                                                                "y": barOrder(i)},
                                                              { "x": dotScale(d.temp),
                                                                "y": barOrder(i)},
                                                            ])
                                      }
                 )
            .style("stroke-width", 1)
            .style("stroke", 'MediumSeaGreen')
            .style("fill", "none")
            .transition()
                .attr("d", function(e, j) { return lineFunction([ { "x": dotScale(d.temp),
                                                                    "y": barOrder(i)},
                                                                  { "x": dotScale(e),
                                                                    "y": barOrder(i) + ((2*j) - 1) - (m.length/2)}
                                                                ])
                                          }
                     )

        lines.exit()
            .remove();


        var values = svg.selectAll("circle").data(m);
        values.enter()
            .append("circle");

        values
            .attr("cx", function(e){return dotScale(d.temp)})
            .attr("cy", function(e, j){return barOrder(i)})
            .attr("fill", "black")
            .style("stroke", 'MediumSeaGreen')
            .attr("r", 2.5)
            .transition()
                .attr("cx", function(e){return dotScale(e)})
                .attr("cy", function(e, j){return barOrder(i) + ((2*j) - 1) - (m.length/2)})

        values.exit()
            .remove();
    }


    update(data);
}

loadData();