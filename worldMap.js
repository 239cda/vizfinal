var worldMap = function(){
    var projection = d3.geoMercator()
        .center([55,20])
        .scale(120)
        .translate([width / 2, height / 2]);

    var currentAttribute = "bmi_female";//default;
    var currentYear = 2008;//default;

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

    function _setCurrentYear(newYear){
        currentYear = newYear;
    }
    function _getCurrentYear(){
        return currentYear;
    }
    function _setCurrentAttribute(newAttr){
        currentAttribute = newAttr;
    }
    function _getCurrentAttribute(){
        return currentAttribute;
    }
    function _loadData() {
        var promises = [
            d3.json("data/world-110m.geojson"),
            d3.csv("data/newData.csv", function (d) {
                var country = d.code;
                var year = d.year;

                for (var i = 0; i < totalDataAttr.length; i++) {
                    var data = d[totalDataAttr[i]];

                    if (totalData[totalDataAttr[i]][country] == null) {
                        //create new
                        if(country != "") {
                            totalData[totalDataAttr[i]][country] = {};
                            totalData[totalDataAttr[i]][country]["countryName"] = d.country;
                        }
                    }

                    if (!isNaN(data) && data != null && data != "" && country != "") {
                        totalData[totalDataAttr[i]][country][year] = +data;

                        //compare with current max/min of this attribute
                        var min = minMax[totalDataAttr[i]].min;
                        var max = minMax[totalDataAttr[i]].max;

                        if(+data < min){
                            minMax[totalDataAttr[i]].min = +data;
                        }
                        else if(+data > max){
                            minMax[totalDataAttr[i]].max = +data;
                        }

                    }
                }
            })
        ];

        Promise.all(promises).then(_draw)
    }
    function _getColorDomain(){
        var attr = _getCurrentAttribute();
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
        var color;

        for(var i = 0; i <colorDomain.length; i++){
            if(value <= colorDomain[i]){
                color = colorList[i];
                break;
            }
        }

        return color;
    }
    function _draw([topo]) {
        console.log(topo)
        console.log(totalData)
        console.log(minMax)

        var svg = d3.select("#mapSVG");


        var div = d3.select("#mapDiv").append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        var colorDomain = _getColorDomain();

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                var countryCode = d.id;
                var attr = _getCurrentAttribute();
                var year = _getCurrentYear();

                if(totalData[attr][countryCode] != null) {
                    var val = totalData[attr][countryCode][currentYear];
                    return _getColorVal(colorDomain, val);
                }
                else{
                    return "#e6e6e6";
                }
            })
            .on("mouseover", function(d){
                div.style("opacity", 0.7)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");

                div.html(d.properties.name);
            })
            .on("mouseout", function(d) {
                div.style("opacity", 0)
            });
    }
    function _main(){
     _loadData();
    }
    return{
        main:_main
    }
}();
