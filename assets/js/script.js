var cityHistory = JSON.parse(localStorage.getItem('history')) || []

// object looks like this:
// cityHistory = [
//     {
//         name: 'Hialeah',
//         current: {api obj},
//         forecast: {api obj}
//     },

//     {
//         name: 'New York',
//         current: {api obj},
//         forecast: {api obj}
//     }
// ]

function getCoord(city) {
    var key = '15dca0d0b372553e6b4758c35f61904a';
    var url = new URL(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${key}`);

    getCoordApi(url);
}

function getWeatherAt(lat, lon) {
    var key = '15dca0d0b372553e6b4758c35f61904a';

    getWeatherAPI(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`);
    
    //different url for forecast api
    getForecastAPI(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`);
}

function getCoordApi(url) {
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                alert('failed');
            }
        })
        .then(function (data) {
            getWeatherAt(data[0].lat, data[0].lon);
        });
}

function getWeatherAPI(url) {
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                alert('failed');
            }
        })
        .then(function (data) {
            sameDayWeather(data);
        });
}

function getForecastAPI(url) {
    fetch(url)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                alert('failed');
            }
        })
        .then(function (data) {
            fiveDayWeather(data);
        });
}

function sameDayWeather(cityCurrentWeather) {
    console.log(cityCurrentWeather);
    //load data in html

    //save history
    saveInHistoryWeather(cityCurrentWeather)
    localStorage.setItem('history', JSON.stringify(cityHistory));
}

function fiveDayWeather(cityWeatherForecast) {
    console.log(cityWeatherForecast);
    //load data in html

    //save history
    saveInHistoryForecast(cityWeatherForecast);
    localStorage.setItem('history', JSON.stringify(cityHistory));
}

//loops through history array and checks if a city weather object exists
function saveInHistoryWeather(data) {
    var cityName = data.name;

    for (var i = 0; i < cityHistory.length; i++) {
        if (cityHistory[i].name == cityName) {
            cityHistory[i].current = data;
            return;
        }
    }

    var tempObject = {
        name: cityName,
        current: data
    }

    cityHistory.push(tempObject);
}

function saveInHistoryForecast(data) {
    var cityName = data.city.name;

    for (var i = 0; i < cityHistory.length; i++) {
        if (cityHistory[i].name == cityName) {
            cityHistory[i].forecast = data;
            return;
        }
    }

    var tempObject = {
        name: cityName,
        forecast: data
    }

    cityHistory.push(tempObject);
}

getCoord('hialeah');
getCoord('new york');