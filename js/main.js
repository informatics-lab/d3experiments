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
    var barPadding = 0.1;

    var svg = d3.select("body")
                .append("svg")
                    .attr("width", w)
                    .attr("height", h);

    // width = 100;
    barLength = d3.scale.linear()
                    .domain(d3.extent(data, function(d){return d.temp;}))
                    .range([-w/2, w/2]);
    // g = barLength;


    svg.selectAll("rect")
        .data(data)
            .enter()
            .append("rect")
                .attr("x", function(d) {return w / 2 + Math.min(0.0, barLength(d.temp));})
                .attr("y", function(d, i){ return i * (h / (data.length)); })
                .attr("height", (h / data.length) * (1.0-barPadding))
                .attr("width", function(d) { return Math.abs(barLength(d.temp)); })
                .attr("fill", "teal")
}


loadData();