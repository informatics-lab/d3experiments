var hadcrut = [];

loadData = function(){
  d3.text("data/HadCRUT.4.4.0.0.annual_ns_avg.txt", function(error, text) {
    var rows = d3.tsv.parseRows(text)
    rows.forEach(function(row){ 
        var els = row[0].split(/\s+/);
        hadcrut.push({"year": parseInt(els[0]), "temp": parseFloat(els[1])});
    })

    testdata = [{"year": 2000, "temp": -32}, {"year": 2001, "temp": 42}, {"year": 2002, "temp": 13}, {"year": 2003, "temp": 23}]
    horizBarChart(hadcrut);
  });
};

horizBarChart = function(data){
    var w = 500;
    var h = 700;
    var barPadding = 0.5;

    var svg = d3.select("body")
                .append("svg")
                    .attr("width", w)
                    .attr("height", h);

    var chronologicalOrder = function(a, b) {return a.year - b.year;}
    var temperatureOrder = function(a, b) {return a.temp - b.temp;}

    d3.select("body")
      .append("label")
        .html("<input id=sortCheck type=checkbox> sort years")
      .on("change", function(){
        svg.selectAll(".bar")
           .sort(d3.select("#sortCheck").property("checked") ? temperatureOrder : chronologicalOrder)
        svg.transition()
            .duration(200)
            .selectAll(".bar")
            .delay(function(d, i){ return i * 30; })
            .attr("y", function(d, i){ return barOrder(i) })
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

    g = colorIntensity;


    svg.selectAll(".bar")
        .data(data)
            .enter()
                .append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) {return w / 2 + Math.min(0.0, barLength(d.temp));})
                    .attr("y", function(d, i){ return barOrder(i) })
                    .attr("height", (h / data.length) * (1.0-barPadding))
                    .attr("fill", function(d) {
                        var rgbstr = ""
                        if (d.temp <= 0.0){
                            rgbstr = "rgb(0, 0, "+ Math.round(colorIntensity(Math.abs(d.temp))) +")";
                        }else{
                            rgbstr = "rgb("+ Math.round(colorIntensity(Math.abs(d.temp))) +", 0, 0)";
                        }
                        return rgbstr
                    })
                    .attr("width", function(d) { return Math.abs(barLength(d.temp)); })
                    .on("mouseover", function(d){
                        tooltip.transition()
                                    .duration(500)
                                    .style("opacity", 0.9)
                        tooltip.html(d.year + " " + d.temp + " &deg;C")
                                .style("left", (d3.event.pageX) + "px")          
                                .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d){
                        tooltip.transition()
                                    .duration(500)
                                    .style("opacity", 0.0)
                    })

    }


loadData();