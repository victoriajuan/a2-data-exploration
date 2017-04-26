$(function() {
    
    var margin = {
        top: 10,
        right: 10,
        bottom: 150,
        left: 60
    };

    var width = 1150;
    var height = 700;
    
    var drawWidth = width - margin.left - margin.right;
    var drawHeight = height - margin.top - margin.bottom;

    /************************************** Create chart wrappers ***************************************/
    var svg = d3.select('#viz')
                .attr('width', width)
                .attr('height', height);

    var g = svg.append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('height', drawHeight)
                .attr('width', drawWidth);
    
    var tooltip = d3.select("body").append("div").attr("class", "toolTip");

    d3.csv('data/Traffic_Violations.csv', function(error, data) {

        /************************************** Data prep ***************************************/
        
        var nestedData = d3.nest()
                    .key(function(d) { return d.Race; })
                    .key(function(d) { 
                        if(d.Year < 2017 && d.Year > 1800 && d.Year != 'undefined'){
                            return d.Year;
                        } 
                    })
                    .rollup(function(d) { return d.length; })
                    .entries(data);

        console.log(nestedData);
        var measure = 'HISPANIC';

        /************************************** Defining scales and axes ***************************************/

        var temp = {};

        nestedData.forEach(function(d) {
            if(d.key == measure){
                temp = d; //current race subobject
            }       
        });

        var combination = (temp.values).map(function(d) {
            return d.key;
        });

        var xScale = d3.scaleBand()
                        .domain(combination)
                        .range([0, drawWidth]).padding(0.2);

        var xAxis = d3.axisBottom()
                        .scale(xScale);

        var yMax = d3.max(temp.values, function(d) {
            return +d.value;
        }) * 1.8;

        var yScale = d3.scaleLinear()
                        .domain([0, yMax])
                        .range([drawHeight, 0]);

        var yAxis = d3.axisLeft()
                        .scale(yScale);
        
        var xAxisLabel = svg.append('g')
                            .attr('class', 'axis')
                            .attr('transform', 'translate(' + margin.left + ',' + (drawHeight + margin.top) + ')')
                            .call(xAxis);

        xAxisLabel.selectAll('text')
                    .attr('transform', 'rotate(-45)')
                    .attr('dx', '-0.5em')
                    .attr('dy', '0.15em')
                    .style('text-anchor', 'end');

        var xAxisText = svg.append('text')
                            .attr('transform', 'translate(' + (margin.left + drawWidth / 2 - 115) + ',' + (drawHeight + margin.top + 80) + ')')
                            .attr('class', 'axis-label')
                            .text('Years');
        
        var yAxisLabel = svg.append('g')
                            .attr('class', 'axis')
                            .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')')
                            .call(yAxis);

        var yAxisText = svg.append('text')
                            .attr('transform', 'translate(' + (margin.left - 45) + ',' + (margin.top + drawHeight / 2) + ') rotate(-90)')
                            .attr('class', 'axis-label')
                            .text('Violantion Total');

         /************************************** Drawing Data ***************************************/
        
        var draw = function(measure) {
            var dataTemp = {};
            nestedData.forEach(function(d) {
                if(d.key == measure){ // find certain race object
                    dataTemp = d; //only one object in it with current race
                }
            });

            var bars = g.selectAll('rect').data(dataTemp.values); 

            bars.enter().append('rect')
                .attr('x', function(d) {
                    return xScale(d.key);
                })
                .attr('y', function(d) {
                    return yScale(d.value);
                })
                .attr('height', function(d) {
                    return drawHeight - yScale(d.value);
                })
                .attr('width', xScale.bandwidth())
                .attr('class', 'bar')
                .on("mousemove", function(d){
                    tooltip
                    .style("left", d3.event.pageX - 30 + "px")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("display", "inline-block")
                    .html(d.key + "</br>"+ "Total Violation: " + (d.value));
                })
    		    .on("mouseout", function(d){ tooltip.style("display", "none");});
        }

        draw(measure);

        $("input").on('change', function() {
            d3.selectAll('rect').data(nestedData).exit().remove();
            measure = $(this).val();
            draw(measure);
        });       
    });
});