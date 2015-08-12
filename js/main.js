var hadcrut = [];

loadData = function(){
  d3.text("data/HadCRUT.4.4.0.0.annual_ns_avg.txt", function(error, text) {
    var rows = d3.tsv.parseRows(text)
    rows.forEach(function(row){ 
        var els = row[0].split(/\s+/);
        hadcrut.push({"year": parseInt(els[0]), "temp": parseFloat(els[1])});
    })

    horizBarChart(hadcrut);
  });
};


horizBarChart = function(allData){
    var data = allData;
    var w = 500;
    var h = 700;
    var barPadding = 0.5;

    var svg = d3.select("body")
                .append("svg")
                    .attr("width", w)
                    .attr("height", h);

    var chronologicalOrder = function(a, b) {return a.year - b.year;}
    var temperatureOrder = function(a, b) {return a.temp - b.temp;}

    var reorder = function(order){
        svg.selectAll(".bar")
           .sort(order)
        svg.transition()
            .duration(400)
            .selectAll(".bar")
            .delay(function(d, i){ return i * 1000 / data.length; })
            .attr("y", function(d, i){ return barOrder(i) })
    }

    d3.select("body")
      .append("label")
        .attr("id", "sort")
        .html("<input id=sortCheck type=checkbox> sort years")
      .on("change", function(){
           reorder(d3.select("#sortCheck").property("checked") ? temperatureOrder : chronologicalOrder)
      })

    d3.select("#filterData")
        .on("click", function(d) {
            var minTemp = d3.select("#minTemp").property("value");
            var maxTemp = d3.select("#maxTemp").property("value");
            data = allData.filter(function(d){return d.temp >= minTemp && d.temp < maxTemp});
            update(data);
         })

    // width = 100;
    var barLength = d3.scale.linear()
                    .domain(d3.extent(data, function(d){return d.temp;}))
                    .range([-w/2, w/2]);
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
        
        bar.enter()
            .append("rect")
                .attr("class", "bar")
                .attr("y", function(d, i){ return barOrder(i) })
                .attr("height", (h / data.length) * (1.0-barPadding))
                .attr("width", 0)
                .attr("x", function(d) {return w / 2;})
                    .transition()
                    .delay(function(d, i) { return i * 400 / data.length; })
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
        
        bar.attr("y", function(d, i){ return barOrder(i) })
            .on("mouseover", function(d){
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
                });
        
        bar.exit()
            .transition()
                .duration(1000)
                .attr("width", 0)
                .attr("x", function(d) {return w / 2;})
            .remove()

    }


    update(data);
}

loadData();