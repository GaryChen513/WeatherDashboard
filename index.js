var cityArray;
var key = "3ca1e422554d7d4374bc0845ab9b7638";
cityArray = [...new Set(JSON.parse(localStorage.getItem("weather-city")|| "[]"))];
renderSearchHistory();
renderWeather(cityArray[0]);

$("#search-bar").on("click", "button",function(event){
    event.preventDefault();
    let city = $(this).parent().find("input").val();
    renderWeather(city);
});

$(".list-group").on("click", "button", function(event){
    event.preventDefault();
    let cityToDelete = $(this).prev().text();
    cityArray.splice(cityArray.indexOf(cityToDelete),1);
    renderWeather(cityArray[0]);
    event.stopPropogation();
});

$(".list-group").on("click", ".list-group-item", function(event){
    event.preventDefault();
    let cityToTop = $(this).find(".cityName").text();
    renderWeather(cityToTop);
})


function appendCityToTop(city){
    let index = cityArray.indexOf(city);
    if (index !== -1){
        cityArray.splice(index, 1);
    }
    cityArray.unshift(city);
}

function renderSearchHistory(){
    $("ul").find("li").not(":first").remove();
    let li = $("ul").find("li:first").clone();
    cityArray.forEach(function(his_city){
        let li_copy =  li.clone();
        li_copy.removeClass("display-none")
        li_copy.find(".cityName").text(his_city)
        $("ul").append(li_copy);
    })
}

function renderWeather(city){
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + key;
    let date = moment().format('L'); 
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(res){
        
        $("#cityName").text(res.name);
        $("#currentDate").text("("+date+")");
        let imgSrc= "https://openweathermap.org/img/w/" + res.weather[0].icon + ".png";
        $("#icon").find("img").attr("src",imgSrc);
        $("#temperature").text(res.main.temp+"°C");
        $("#humidity").text(res.main.humidity+"%");
        $("#windspeed").text(res.wind.speed+"MPH");
    
        let lat = res.coord.lat;
        let lon = res.coord.lon;
        displayTargetCityUVindex(lat,lon);
        displayTargetCityFutureWeather(lat,lon,5);

    }).then(function(){
        $("#search-bar").find("#searchCity").val(city);
        appendCityToTop(city);
        renderSearchHistory();
        localStorage.setItem("weather-city", JSON.stringify(cityArray));
    })
}


function displayTargetCityUVindex(lat, lon){
    var queryURL1 = "https://api.openweathermap.org/data/2.5/uvi?lat="+lat+"&lon="+lon+"&appid="+key;
    $.ajax({
        url: queryURL1,
        method: "GET"
    }).then(function(res){
        let UVvalue = res.value;
        $("#UVindex").text(UVvalue);
        if (parseInt(UVvalue)< 3){
            $("#UVindex").attr("class", "favorable");
        }else if (3<=parseInt(UVvalue) && parseInt(UVvalue)<=5){
            $("#UVindex").attr("class", "moderate");
        }else{
            $("#UVindex").attr("class", "severe");
        }
    })
}

function displayTargetCityFutureWeather(lat, lon, cnt){
    var queryURL2= "https://api.openweathermap.org/data/2.5/find?lat="+lat+"&lon="+lon+"&cnt="+cnt+"&units=metric&appid="+key;
    $.ajax({
        url: queryURL2,
        method:"GET"
    }).then(function(res){
        var list = res.list;
        var dateDummy = moment();
        $(".card").each(function(index){
            dateDummy = dateDummy.add(1, 'days');
            $(this).find(".date").text(dateDummy.format('L'));
            let imgSrc= "https://openweathermap.org/img/w/" + list[index].weather[0].icon + ".png";
            $(this).find("img").attr("src",imgSrc);
            $(this).find(".temp").text(list[index].main.temp + "°C");
            $(this).find(".humid").text(list[index].main.humidity + "%");
        })
    })
}


