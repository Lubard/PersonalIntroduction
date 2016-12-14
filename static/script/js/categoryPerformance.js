
        var category;
        var categories;
        d3.json("categoryData", function(error, json) {
            if (error) throw error;
//            category = json;
            categories = json;
            category = categories["categories"];

            //allocate the color guide
            var colorguide=[];

            var number_of_closed_questions = [];
            var color_scale = [];

            var Brier_75 = 0;
            var Brier_25 = 0;
            var Number_of_Closed_Questions = 0;
            var Brier_Mean = 0;
            var Mean_RSOF = 0;
            var Total_Number_of_Forecast = 0;

            for(var i=0; i<category.length; i++){

                Brier_75 += category[i]["75Brier"]*category[i]["Number of Closed Questions"];
                Brier_25 += category[i]["25Brier"]*category[i]["Number of Closed Questions"];
                Number_of_Closed_Questions += category[i]["Number of Closed Questions"];
                Brier_Mean += category[i]["Brier Mean"]*category[i]["Number of Closed Questions"];
                Mean_RSOF += category[i]["Mean RSOF"]*category[i]["Number of Closed Questions"];
                Total_Number_of_Forecast += category[i]["Total Number of Forecasts"];


                number_of_closed_questions.push(category[i]["Number of Closed Questions"]);
                color_scale.push(category[i]["Total Number of Forecasts"]/category[i]["Number of Closed Questions"]);
            }

            // the last circle
            Brier_75 /= Number_of_Closed_Questions;
            Brier_25 /= Number_of_Closed_Questions;
            Brier_Mean /= Number_of_Closed_Questions;

            Mean_RSOF /= Number_of_Closed_Questions;
            var avgCircle = { "category":"All",
                "75Brier": Brier_75,
                "25Brier": Brier_25,
                "Number of Closed Questions": Number_of_Closed_Questions,
                "Brier Mean": Brier_Mean,
                "Mean RSOF": Mean_RSOF,
                "Total Number of Forecasts": Total_Number_of_Forecast
            };
            category.push(avgCircle);
            number_of_closed_questions.push(Number_of_Closed_Questions);
            color_scale.push(Total_Number_of_Forecast/Number_of_Closed_Questions);

            number_of_closed_questions.sort(function compareNumbers(a, b) {
                return a - b;
            });
            color_scale.sort(function compareNumbers(a, b) {
                return a - b;
            });

            // catch the change for radios
            d3.selectAll("input").on("change", figure);
            // catch the value from radios
            var x = document.getElementsByName("x"),
                    y = document.getElementsByName("y");
            var xval,
                    yval;
            for (var i = 0; i < x.length; i++) {
                if (x[i].checked) {
                    xval = x[i].value;
                }
            }
            for (var i = 0; i < y.length; i++) {
                if (y[i].checked) {
                    yval = y[i].value;
                }
            }


            // normal sets for svg
            var width = 800,
                    height = 600,
                    padding = 50;
            var svg = d3.select("#canvas").append("svg")
                   // .attr("class","Aligner")
                    .attr("width", width)
                    .attr("height", height);

            // draw the axises, and define the Scale
            //.ordinal output the catagories names
            var xScale = d3.scale.ordinal()
                    .domain(category.map(function (d) {
                        return d.category;
                    }))
                    .rangePoints([60, width - 2* padding]);
            var yScale = d3.scale.linear()
                    .domain([1, 0])
                    .range([50, 450]);
            var yScaleBrier = d3.scale.linear()
                    .domain([0,0.5,2])
                    .range([50,250,450]);

            var raduisScale = d3.scale.log()
                    .domain([number_of_closed_questions[0],number_of_closed_questions[category.length-1]])
                    .range([0, 20]);
            var colorScale = d3.scale.linear()
                    //.domain(category.map(function (d) {
                    //    return (d["Total Number of Forecasts"]/d["Number of Closed Questions"]);
                    //}))
                    .domain([color_scale[category.length-1],color_scale[0]])
                    .range([ "#276480","#49BCEF"])
                    .interpolate(d3.interpolateRgb);

            // Put Axises into the svg
            var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .ticks(5)
                    .orient("bottom"); // rough of ticks
            var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5) // rough of ticks
                    .tickFormat(d3.format("%"));

            var yAxisBrier = d3.svg.axis()
                    .scale(yScaleBrier)
                    .orient("left")
                    .ticks(5)
                    .tickFormat(d3.format(".01"));
            svg.append("g")
                    .attr("class", "xaxis")
                    .call(xAxis)
                    .attr("transform", "translate(0," + (height - 3*padding) + ")")
                    .selectAll("text")
                    .attr("y", 20)
                    .attr("x", 6);
            svg.append("g")
                    .attr("class", "yaxis")
                    .call(yAxis)
                    .attr("transform", "translate(" + padding + ",0)");

            // for the top 75% and bottom 25% users, also highlight the 75% and 25% score
            var briertrends = svg.selectAll("body").data(category).enter()
                    .append("line")
                    .attr("class", "line")
                    .style("opacity", 0)
                    .attr("x1", function (d) {
                        return xScale(d["category"]);
                    }).attr("x2", function (d) {
                        return xScale(d["category"]);
                    })
                    .attr("y1", function (d) {
                        return yScaleBrier(d["75Brier"]);
                    })
                    .attr("y2", function (d) {
                        return yScaleBrier(d["25Brier"]);
                    })
                    .on("mouseover", function (d) {
                        return tooltipShow(d, "trend");
                    })
                    .on("mouseout", function (d) {
                        return tooltipHide(d);
                    });
            var higherlines = svg.selectAll("body").data(category).enter()
                    .append("line")
                    .attr("class", "line")
                    .style("opacity", 0)
                    .attr("x1", function (d) {
                        return xScale(d["category"])-5;
                    }).attr("x2", function (d) {
                        return xScale(d["category"])+5;
                    })
                    .attr("y1", function (d) {
                        return yScaleBrier(d["75Brier"]);
                    })
                    .attr("y2", function (d) {
                        return yScaleBrier(d["75Brier"]);
                    })
                    .on("mouseover", function (d) {
                        return tooltipShow(d, "trend");
                    })
                    .on("mouseout", function (d) {
                        return tooltipHide(d);
                    });
            var lowerlines = svg.selectAll("body").data(category).enter()
                    .append("line")
                    .attr("class", "line")
                    .style("opacity", 0)
                    .attr("x1", function (d) {
                        return xScale(d["category"])-5;
                    }).attr("x2", function (d) {
                        return xScale(d["category"])+5;
                    })
                    .attr("y1", function (d) {
                        return yScaleBrier(d["25Brier"]);
                    })
                    .attr("y2", function (d) {
                        return yScaleBrier(d["25Brier"]);
                    })
                    .on("mouseover", function (d) {
                        return tooltipShow(d, "trend");
                    })
                    .on("mouseout", function (d) {
                        return tooltipHide(d);
                    });

            // define the pop-up
            var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);



            // for the circles
            var circles = svg.selectAll("circle")
                    .data(category)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {
                        return xScale(d["category"]);
                    })
                    .attr("r", function (d) {
                        return (raduisScale(d["Number of Closed Questions"])+3)*1.5;
                    })
                    .style("fill", function (d) {
                        colorguide.push(d["Total Number of Forecasts"]/d["Number of Closed Questions"]);
                        return colorScale(d["Total Number of Forecasts"]/d["Number of Closed Questions"]);
                    }).attr("cy", function (d) {
                        return yScale(d["Mean RSOF"]);
                    })
                    .on("mouseover", function (d) {
                        return tooltipShow(d, xval);
                    })
                    .on("mouseout", function (d) {
                        return tooltipHide(d);
                    });


            // manage the line shows
            var lineShow = false;
            function briertrend() {
                if (lineShow == false) {
                    briertrends.transition()
                            .duration(500)
                            .style("opacity", .9);
                    higherlines.transition()
                            .duration(500)
                            .style("opacity", 1);
                    lowerlines.transition()
                            .duration(500)
                            .style("opacity", 1);
                    lineShow = true;
                } else {
                    briertrends.transition()
                            .duration(500)
                            .style("opacity", 0);
                    higherlines.transition()
                            .duration(500)
                            .style("opacity", 0);
                    lowerlines.transition()
                            .duration(500)
                            .style("opacity", 0);
                    lineShow = false;
                }
            }

            // check the value change again
            function figure() {
                for (var i = 0; i < x.length; i++) {
                    if (x[i].checked) {
                        xval = x[i].value;
                    }
                }
                for (var i = 0; i < y.length; i++) {
                    if (y[i].checked) {
                        yval = y[i].value;
                    }
                }
                if((xval=="Accuracy")&&(lineShow=true)){
                    briertrend();
                }

                Change();
            }

            function tooltipShow(d, xval) {
                tooltip.transition()
                        .duration(100)
                        .style("opacity", .9);
                if (xval == "Accuracy") {
                    tooltip.html(d["category"] + "<br/> [" + xval
                                    + ": " + d["Mean RSOF"].toFixed(2)*100+"%" + "]"
                                    + "<br> [Number of Forecasts: " + d["Total Number of Forecasts"] + "]"
                                    + "<br> [Forecasts Per Question: "
                                    + Math.round(d["Total Number of Forecasts"]/d["Number of Closed Questions"]) + "]"
                    )
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                } else if (xval == "Brier") {
                    tooltip.html(d["category"] + "<br/> [" + xval
                                    + "Score : " + d["Brier Mean"].toFixed(2) + "]"
                                    + "<br> [Number of Forecasts: " + d["Total Number of Forecasts"] + "]"
                                    + "<br> [Forecasts Per Question: "
                                    + Math.round(d["Total Number of Forecasts"]/d["Number of Closed Questions"]) + "]"
                    )
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                } else if (lineShow == true) {
                    tooltip.html("50% of " + d["category"] + " questions have a Brier score of less than " + d["75Brier"].toFixed(2) + " and greater than " + d["25Brier"].toFixed(2) + ".")
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                }
            }
            function tooltipHide(d) {
                tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
            }

            function Change() {
                //check the radio status
                var accuracyflag = true;
                var categoryflag = true;
                if (xval == "Brier") {
                    accuracyflag = false;
                    lineShow = false;
                    briertrend()
                } else {
                    lineShow = true;
                    briertrend()
                }
                if (yval == "category"){
                    categoryflag = false;
                }

                circles = svg.selectAll("circle")
                        .data(category)
                        .transition()
                        .duration(1000);
                if (accuracyflag == true) {
                    circles.attr("cy", function (d) {
                        return yScale(d["Mean RSOF"]);
                    });
                    svg.selectAll(".yaxis")
                            .call(yAxis)
                            .transition()
                            .duration(1000);
                }
                else {
                    circles.attr("cy", function (d) {
                        return yScaleBrier(d["Brier Mean"]);
                    });
                    svg.selectAll(".yaxis")
                            .call(yAxisBrier)
                            .transition()
                            .duration(1000);
                }
            }
            colorguide.sort(function(a, b){return a-b});
            // the tags that explain the
            var legend = svg.selectAll(".legend")
                    .data(colorguide)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(" + i * 20 + ",0)"; });
            legend.append("rect")
                    .attr("x", 2 * padding)
                    .attr("y", height - 36)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function (d) {
                        return colorScale(d);
                    });

            svg.select(".legend")
                    .append("text")
                    .attr("x", 2 * padding + 9)
                    .attr("y", height)
                    .style("text-anchor", "end")
                    .text(function(d){return colorguide[0].toFixed(0)});
            svg.select(".legend")
                    .append("text")
                    .attr("x", 2 * padding + 9 + 20*colorguide.length)
                    .attr("y", height)
                    .style("text-anchor", "end")
                    .style("text-anchor", "end")
                    .text(function(d){return colorguide[colorguide.length-1].toFixed(0);});

          });
