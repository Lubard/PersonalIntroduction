/**
 * Created by William on 01/11/16.
 */
    d3.csv("swedish", function (err, data) {
        swedishFinanceData = [{
            "key": "Price_level",
            "bar": "true",
            "values": []
        }, {
            "key": "Inflation",
            "values": []
        }];

        data.forEach(function (d) {
            temp = [parseInt(d.Period), parseInt(d.Price_level.replace(",", ""))];
            swedishFinanceData[0].values.push(temp);
            temp = [parseInt(d.Period), parseFloat(d.Inflation)];
            swedishFinanceData[1].values.push(temp);
        });

        nv.addGraph(function () {
            var chart = nv.models.linePlusBarChart()
                    .margin({top: 30, right: 60, bottom: 20, left: 60})
                    .x(function (d, i) {
                        return d[0]
                    })
                    .y(function (d, i) {
                        return d[1]
                    })
                    .options({focusEnable: false});

            chart.xAxis
                    .tickFormat(d3.format(',d'));
            chart.y1Axis
                    .tickFormat(function (d) {
                        return d3.format(',d')(d)
                    });
            chart.y2Axis
                    .tickFormat(function (d) {
                        return d3.format(',3f')(d)
                    });

            d3.select('#swedish svg')
                    .datum(swedishFinanceData)
                    .transition().duration(500)
                    .call(chart);

            nv.utils.windowResize(chart.update);
            return chart;
        });
    });