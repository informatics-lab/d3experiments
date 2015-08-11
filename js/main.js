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

horizBarChart = function(data){
    var w = 500;
    var h = 100;
    var barPadding = 1;

    var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    width = 100;
    barLength = d3.scale.linear()
                    .domain(d3.extent(data, function(d){return d.temp;}))
                    .range([0, width]);
    g = barLength;


    svg.selectAll("rect")
        .data(data)
            .enter()
            .append("rect")
                .attr("y", function(d, i){
                    return i * (w / data.length - barPadding);
                })
                .attr("width", function(d){
                    return Math.abs(d.temp);
                })
}


loadData();