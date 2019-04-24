//initialize the world map
var main = function(){

    function _getCurrentYear(){
        var year = document.getElementById("yearRange").value;
        return year;
    }

    function _getCurrentAttribute(){
        var data = document.getElementById("dataDropDown").value;
        return data;
    }
    return{
        getCurrentYear:_getCurrentYear,
        getCurrentAttribute:_getCurrentAttribute
    }


}();
