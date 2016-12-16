/**
 * Created by William on 16/12/16.
 */
    d3.csv("geolocationData", function (err, data) {
        chartData = [];
        dict = {"Boston": [], "SanDiego": [], "Washington": [], "Seattle": [], "Houston": []};
        data.forEach(function (d) {
            temp = {
                x: parseInt(d.Frequent),
                y: parseFloat(d.Chi_square),
                size: parseInt(d.Total),
                feature: d.Feature,
                shape: "circle"
            };
            dict[d.City].push(temp);
        });
        for (var city in dict) {
            temp = {
                key: city,
                values: dict[city]
            };
            chartData.push(temp);
        }
        nv.addGraph(function () {
            var chart = nv.models.scatterChart()
                    .showDistX(true)    //showDist, when true, will display those little distribution lines on the axis.
                    .showDistY(true)
                    .color(d3.scale.category10().range());

            //Configure how the tooltip looks.
            chart.tooltip.contentGenerator(function (key) {
                return ('<h3>' + key.point["feature"] + '</h3>'
                        + '<p>' + "Chi-Square: " + key.point["y"] + '</p>'
                        + '<p>' + "Count: " + key.point["size"] + '</p>'

                );
            });

            //Axis settings
            chart.xAxis
                    .tickFormat(d3.format('.d'));
            chart.yAxis
                    .ticks([50, 200])
                    .tickFormat(d3.format('.02f'));

            chart.xDomain([0, 200, 400, 1000, 2000])
                    .xRange([0, 800, 1100, 1200, 1250]);
            chart.yDomain([50, 400, 4000])
                    .yRange([500, 200, 0]);

            chart.pointDomain([0, 50, 200])
                    .pointRange([10, 50, 100]);
            d3.select('#geolocation svg')
                    .datum(chartData)
                    .call(chart);

            nv.utils.windowResize(chart.update);

            return chart;
        });
    });
