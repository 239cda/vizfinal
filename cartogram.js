var Cartogram = function(){
    var currentAttribute = "healthSpending";
    var currentYear = 1980;//default;
    var totalDataAttr = ["bmi_female", "bmi_male",	"foodConsumption","healthSpending",	"lifeExpectancy",	"sugarConsumption", "suicide"];

    var totalData = {
        "bmi_female":{},
        "bmi_male" : {},
        "foodConsumption" : {},
        "healthSpending" : {},
        "lifeExpectancy" : {},
        "sugarConsumption":{},
        "suicide":{}
    };

    var minMax = {
        "bmi_female":{"min":Infinity, "max":0},
        "bmi_male" : {"min":Infinity, "max":0},
        "foodConsumption" : {"min":Infinity, "max":0},
        "healthSpending" : {"min":Infinity, "max":0},
        "lifeExpectancy" : {"min":Infinity, "max":0},
        "sugarConsumption":{"min":Infinity, "max":0},
        "suicide":{"min":Infinity, "max":0}
    };

    var colorList = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"];

    var map = d3.select("#mapSVG");

    var munics = map.append("g")
        .attr("id", "munics")
        .selectAll("path");

    //var proj = d3.geo.equirectangular()
    var proj = d3.geo.mercator()
        .scale(950)
        .translate([500, 420]);

    var baseMapData;

    var topology,
        geometries,
        carto_features;

    var carto = d3.cartogram()
        .projection(proj)
        .properties(function (d) {
            // this add the "properties" properties to the geometries
            return d.properties;
        });

    function _getValue(d){
        var countryCode = d.properties.iso3;
        var attr = main.getCurrentAttribute();
        var year = main.getCurrentYear();

        if (totalData[attr][countryCode] != null) {
            var val = totalData[attr][countryCode][currentYear];
            return parseInt(val);
        }
        else{
            return 0;
        }
    }
    function _getColorDomain(){
        var attr = main.getCurrentAttribute();
        var min = minMax[attr].min;
        var max = minMax[attr].max;

        var gap = (max - min)/colorList.length;

        var domain = [];

        for (var i=1; i<=colorList.length;i++){
            domain.push(min + (gap*i));
        }
        return domain;
    }
    function _getColorVal(colorDomain, value){
        var color = null;

        for(var i = 0; i <colorDomain.length; i++){
            if(value <= colorDomain[i]){
                color = colorList[i];
                break;
            }
        }
        if(color == null){
            color = colorList[colorList.length - 1];

        }
        return color;
    }
    function _getColorIndex(colorDomain, value){
        var index= -1;
        for(var i = 0; i <colorDomain.length; i++){
            if(value <= colorDomain[i]){
                index = i;
                break;
            }
        }
        return index + 1;
    }
    function _loadData(callback) {
        d3.csv("data/newData.csv", function (data) {
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
            callback();
        })
    }
    function _normalize(attr, val){
        var min = minMax[attr].min;
        var max = minMax[attr].max;

        //var array = [0, 10, 100, 1000, 10000, 100000, 1000000];

       // var colorDomain = _getColorDomain();
       // var multiplyBy = (_getColorIndex(colorDomain, val)) ;
        var normalizedVal = (val - min)/(max-min);

        return normalizedVal;
    }
    function _drawLegend(){
        var data = document.getElementById("dataDropDown").value;
        var colorDomain = _getColorDomain();

        var w = 40;
        var h = 30;
        d3.select("#legendSVG").selectAll("*").remove();

        d3.select("#legendSVG").append("g")
            .selectAll("rect")
            .data(colorDomain)
            .enter()
            .append("rect")
            .attr("width", w)
            .attr("height", h)
            .attr("x", function (d,i){
                return i * 50 + 56;
            })
            .attr("y", 10)
            .attr("class", "legend")
            .attr("fill", function (d, i) {

                return colorList[i];
            })

        d3.select("#legendSVG").append("g")
            .selectAll("text")
            .data(colorDomain)
            .enter()
            .append("text")
            .attr("x", function (d,i){
                return i * 50 + 56;
            })
            .attr("y", 53)
            .text(function(d,i){
                return "~" + parseInt(d);
            })
    }
    function _draw() {
        // this loads test the topojson file and creates the map.
        d3.json("geoMap/topojson/world/countries.json", function (data) {
            topology = data;
            geometries = topology.objects.units.geometries;

            var newGeo = [];

            for (var i = 0; i < geometries.length; i++) {
                if (geometries[i].type != null) {
                    newGeo.push(geometries[i]);
                }
            }
            geometries = newGeo;

            //these 2 below create the map and are based on the topojson implementation
            var features = carto.features(topology, newGeo),
                path = d3.geo.path()
                    .projection(proj);

            baseMapData = features;

            var div = d3.select("#mapDiv").append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

            var colorDomain = _getColorDomain();

            munics = d3.select("#mapSVG").append("g")
                .selectAll("path")
                .data(features)
                .enter()
                .append("path")
                .attr("class", "munic")
                .attr("id", function (d) {
                    return d.properties.iso3;
                })
                .attr("fill", function (e) {
                    var countryCode = e.properties.iso3;
                    var attr = main.getCurrentAttribute();
                    var year = document.getElementById("yearRange").value;

                    var color = "#e6e6e6";

                    if(totalData[attr][countryCode] != null) {
                        var val = totalData[attr][countryCode][currentYear];

                        if (val > 0) {
                            color = _getColorVal(colorDomain, val);
                        }
                    }
                    return color;
                }).on("mouseover", function(d){
                    div.style("opacity", 0.7)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");

                    div.html(d.properties.name);
                })
                .on("mouseout", function(d) {
                    div.style("opacity", 0)
                })
                .attr("d", path);

        });
        _drawLegend();
    }
    function _update() {
        if(cartogramOn == false) {
            carto.value(function (d) {
                var countryCode = d.properties.iso3;
                var attr = main.getCurrentAttribute();
                var year = document.getElementById("yearRange").value;

                if (totalData[attr][countryCode] != null) {
                    var val = totalData[attr][countryCode][year];
                    var normalized = _normalize(attr, val);
                    if (val > 0) {
                       //
                        //console.log(normalized);
                        return normalized;
                        //return val / 100;
                    } else {
                        return 1/100;
                        //return 100;
                    }
                } else {
                    return 1/100;
                    //return 100;
                }
            });
            carto_features = carto(topology, geometries).features;

            munics
                .data(carto_features)
                .transition()
                .duration(250)
                .attr("d", carto.path);
            cartogramOn = true;
            document.getElementById("click_to_run").style.backgroundColor = "red";
        }
        else if(cartogramOn = true){
            d3.select("#mapSVG").selectAll("*").remove();
            _draw();
            document.getElementById("click_to_run").style.backgroundColor = "#abadaf";
            cartogramOn = false;
        }
    }
    function _restore(){
        _draw();
    }
    function _switchData(){
        //get current selected value
        var data = document.getElementById("dataDropDown").value;
        var year = document.getElementById("yearRange").value;
        var title = document.getElementById("title");

        var colorDomain = _getColorDomain();

        var dataName = {
            "healthSpending" : "Spending on Health",
            "bmi_male": "Male BMI",
            "bmi_female" : "Female BMI",
            "foodConsumption":"Calories per Day",
            "lifeExpectancy":"Life Expectancy",
            "sugarConsumption" : "Sugar Consumption",
            "suicide": "Suicide Rate"
        }

        title.innerHTML = dataName[data] + " in " + year;

        //d3.select("#mapSVG").selectAll("*").remove();

        munics
            .transition()
            .duration(250)
            .attr("fill", function (e) {
                var countryCode = e.properties.iso3;
                var attr = main.getCurrentAttribute();

                var color = "#e6e6e6";

                if(totalData[attr][countryCode] != null) {
                    var val = totalData[attr][countryCode][year];

                    if (val > 0) {
                        //console.log(val)
                        color = _getColorVal(colorDomain, val);
                    }
                }
                return color;
            })
        _drawLegend();
        scatterplot.switchData();
    }

    function _main(){
        _loadData(_draw);


    }
    return{
        main:_main,
        update:_update,
        switchData:_switchData
    }
}();