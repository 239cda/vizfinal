var scatterplot = function(){
    var matrixW = 70;
    var matrixH = 70;
    var margin = 10;
var dots;
    var totalData = {
        "bmi_female":{},
        "bmi_male" : {},
        "foodConsumption" : {},
        "healthSpending" : {},
        "lifeExpectancy" : {},
        "sugarConsumption":{},
        "suicide":{}
    };
    var totalDataAttr = ["bmi_female", "bmi_male",	"foodConsumption","healthSpending",	"lifeExpectancy",	"sugarConsumption", "suicide"];

    function _calMax(d, attribute){//calculate max and min
        var max = 0;
        var year = main.getCurrentYear();
        var countries = Object.keys(d[attribute]);

        for(var i = 0; i<countries.length;i++){
            var value = parseFloat(d[attribute][countries[i]][year]);


            if(value > max){
                max = value;
            }
        }
        return max;
    }
    var minMax = {
        "bmi_female":{"min":Infinity, "max":0},
        "bmi_male" : {"min":Infinity, "max":0},
        "foodConsumption" : {"min":Infinity, "max":0},
        "healthSpending" : {"min":Infinity, "max":0},
        "lifeExpectancy" : {"min":Infinity, "max":0},
        "sugarConsumption":{"min":Infinity, "max":0},
        "suicide":{"min":Infinity, "max":0}
    };

    function _drawDots(data, attrX, attrY, svg, multiplier) {
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        //x set is the same, with the y set different run 6 times
        //var y = main.getCurrentYear();
        var y = main.getCurrentYear();

        var xData = Object.keys(data[attrX]);
        var yData = Object.keys(data[attrY]);

        var scatterGroup = svg.append("g");

        var xMax = _calMax(data, attrX);
        var yMax = _calMax(data, attrY);

        var xScale = d3.scale.linear()
            .domain([0, xMax])
            .range([0, matrixW]);

        var yScale = d3.scale.linear()
            .domain([0, yMax])
            .range([matrixH - 5, 0]);

        var xAxis = d3.svg.axis()
            .orient("bottom")
            .ticks(0)
            .scale(xScale);

        var yAxis = d3.svg.axis()
            .orient("left")
            .ticks(0)
            .scale(yScale);

        var zAxis = d3.svg.axis()
            .orient("right")
            .ticks(0)
            .scale(yScale);

        var drawXAxis = scatterGroup.append('g')
            .attr('transform', 'translate(' + multiplier * matrixW + margin + ',' + matrixH + ')')
            .attr('class', 'x axis')
            .call(xAxis);

        var drawYAxis = scatterGroup.append('g')
            .attr('transform', 'translate(' + multiplier * matrixW + margin + ',0)')
            .attr('class', 'y axis')
            .call(yAxis);

        var drawZAxis = scatterGroup.append('g')
            .attr('transform', 'translate(' + multiplier * matrixW + margin + matrixW + ',0)')
            .attr('class', 'z axis')
            .call(zAxis);

        dots = scatterGroup.selectAll(".dot")
            .data(xData)
            .enter()
            .append("circle")
            .attr("class", "scatterDots")
            .attr("r", 1)
            .attr("cx", function (d, i) {
                var value = data[attrX][d][y];
                var yValue = data[attrY][d][y];
                if(parseInt(value) > 0 && parseInt(yValue) > 0){
                    return xScale(value) + margin + multiplier * matrixW;
                }
                else {
                    return 0;
                }
            })
            .attr("cy", function (d, i) {
                var value = data[attrX][d][y];
                var yValue = data[attrY][d][y];
                if(parseInt(value) > 0 && parseInt(yValue) > 0){
                    return yScale(yValue);
                }
                else {
                    return 0;
                }
            })
            .attr("fill", "blue")
            .attr("opacity", function(d,i){
                var value = data[attrX][d][y];
                var yValue = data[attrY][d][y];
                if(parseInt(value) > 0 && parseInt(yValue) > 0){

                    return 1;
                }
                else {
                    return 0;
                }
            });


        var line = scatterGroup.append("line")          // attach a line
            .style("stroke", "black")  // colour the line
            .attr("x1", function (d) {
                return matrixW * multiplier + matrixW + margin
            })     // x position of the first end of the line
            .attr("y1", 0)      // y position of the first end of the line
            .attr("x2", function (d) {
                return matrixW * multiplier + matrixW + margin
            })    // x position of the second end of the line
            .attr("y2", matrixH);


    }
    function _addLabel(){
        var dataName = ["Female BMI", "Male BMI","Calories","Health", "Life Exp.","Sugar", "Suicide Rate"];

        d3.select("#labelSVG")
            .append("g")
            .selectAll("text")
            .data(dataName)
            .enter()
            .append("text")
            .attr("x", function (d,i){
                return i * matrixW + 15;
            })
            .attr("y", 10)
            .style("font-size", "10px")
            .text(function(d,i){
                return d;
            })
    }
    function _loadData(callback) {

        d3.csv("data/newData.csv", function (data) {
            /*data.forEach(function (d) {
                var country = d.code;
                var year = d.year;

                for (var i = 0; i < totalDataAttr.length; i++) {
                    var data = d[totalDataAttr[i]];

                    if (totalData[totalDataAttr[i]][year] == null) {
                        //create new
                        if (year != "") {
                            totalData[totalDataAttr[i]][year] = [];
                        }
                    }
                    if (!isNaN(data) && data != null && data != "" && country != "") {
                        totalData[totalDataAttr[i]][year].push(+data);

                        //compare with current max/min of this attribute
                       /!* var min = minMax[totalDataAttr[i]].min;
                        var max = minMax[totalDataAttr[i]].max;

                        if (+data < min) {
                            minMax[totalDataAttr[i]].min = +data;
                        } else if (+data > max) {
                            minMax[totalDataAttr[i]].max = +data;
                        }*!/
                    }

                }
            })*/
            data.forEach(function (d) {
                var country = d.code;
                var year = d.year;

                for (var i = 0; i < totalDataAttr.length; i++) {
                    var data = d[totalDataAttr[i]];

                    if (totalData[totalDataAttr[i]][country] == null) {
                        //create new
                        if (country != "") {
                            totalData[totalDataAttr[i]][country] = {};
                            totalData[totalDataAttr[i]][country]["countryName"] = d.country;
                        }
                    }
                    if (!isNaN(data) && data != null && data != "" && country != "") {
                        totalData[totalDataAttr[i]][country][year] = +data;

                        //compare with current max/min of this attribute
                        var min = minMax[totalDataAttr[i]].min;
                        var max = minMax[totalDataAttr[i]].max;

                        if (+data < min) {
                            minMax[totalDataAttr[i]].min = +data;
                        } else if (+data > max) {
                            minMax[totalDataAttr[i]].max = +data;
                        }
                    }
                }
            })
            callback(totalData);
        })
    }
    function _transition(data, attrX, attrY, svg, multiplier){
        var y = main.getCurrentYear();
        var xData = Object.keys(data[attrX]);
        var xMax = _calMax(data, attrX);
        var yMax = _calMax(data, attrY);

        var xScale = d3.scale.linear()
            .domain([0, xMax])
            .range([0, matrixW]);

        var yScale = d3.scale.linear()
            .domain([0, yMax])
            .range([matrixH - 5, 0]);

        svg.selectAll("circle")
            .transition()
            .duration(350)
                .attr("cx", function (d, i) {
                    //console.log(i)
                    var value = data[attrX][d][y];
                    var yValue = data[attrY][d][y];
                    if(parseInt(value) > 0 && parseInt(yValue) > 0){

                        return xScale(value) + margin + multiplier * matrixW;
                    }
                    else {
                        return 0;
                    }
                })
                .attr("cy", function (d, i) {
                    var value = data[attrX][d][y];
                    var yValue = data[attrY][d][y];
                    if(parseInt(value) > 0 && parseInt(yValue) > 0){
                        return yScale(yValue);
                    }
                    else {
                        return 0;
                    }
                }).attr("opacity", function(d,i){
            var value = data[attrX][d][y];
            var yValue = data[attrY][d][y];
            if(parseInt(value) > 0 && parseInt(yValue) > 0){

                return 1;
            }
            else {
                return 0;
            }
        })

        svg.exit().transition().remove();


    }
    function _switch(data){
        var keys = ["bmi_female", "bmi_male", "foodConsumption", "healthSpending", "lifeExpectancy", "sugarConsumption", "suicide"];
        _addLabel();

        for (var i = keys.length - 1; i>=0;i--){
            var newSVG = d3.select("#scatterSVG"+i)
            for (var h = 0; h<keys.length;h++){
                _transition(data, keys[h], keys[i], newSVG, h)
            }
        }

        //console.log(data)
        document.getElementById("labelDiv").style.display = "flex";
    }
    function _drawGraph(data){
        var keys = ["bmi_female", "bmi_male", "foodConsumption", "healthSpending", "lifeExpectancy", "sugarConsumption", "suicide"];
        //var keys = ["bmi_female", "bmi_male", "foodConsumption"];

        _addLabel();

        for (var i = keys.length - 1; i>=0;i--){
            var newSVG = d3.select("#scatterDiv")
                .append("svg")
                .attr("class", "svgs")
                .attr("id", "scatterSVG" + i);
            for (var h = 0; h<keys.length;h++){
                _drawDots(data, keys[h], keys[i], newSVG, h)
            }
        }

        //console.log(data)
        document.getElementById("labelDiv").style.display = "flex";
        //document.getElementById("verticalLabelDiv").style.display = "inline-block";
    }
    function _main(){
        _loadData(_drawGraph);
    }
    function _switchData(){
        console.log("switchData")
        _switch(totalData);
    }
    return{
        drawGraph:_drawGraph,
        main:_main,
        switchData:_switchData
    }
}();