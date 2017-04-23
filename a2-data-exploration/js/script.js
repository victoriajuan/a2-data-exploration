$(function() {

    // Load data in using d3's csv function.
    d3.csv('data/Traffic_Violations.csv', function(error, data) {

        var data = d3.nest()
                    .key(function(d) { return d.Race; })
                    .rollup(function(d) { return d.length; })
                    .entries(data);
        
        console.log(JSON.stringify(data));


    });
});