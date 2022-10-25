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

function onLoad() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(passed, failed);
    } else {
        console.log("Browser doesn't support geolocation");
        getCoord('sacramento');
    }
}

function passed(position) {
    getWeatherAt(position.coords.latitude, position.coords.longitude)
}

//default location on first load
function failed() {
    getCoord('sacramento');
}

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
            console.log(data);
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
            console.log(data);
            fiveDayWeather(data);
        });
}

//load same-day weather information into html
function sameDayWeather(weatherData) {
    var weatherEl = document.querySelector('#present-weather');
    var weatherIconEl = document.querySelector('#present-weather > img');
    var valueEl = document.querySelectorAll('#present-weather .value');
    var date = dayjs().format('M/D/YYYY');
    //converts to imperial units
    var tempConverted = (weatherData.main.temp - 273.15) * 9 / 5 + 32;
    var speedConverted = weatherData.wind.speed * 2.237;

    //populates city name, date and weather img
    weatherEl.getElementsByTagName('h2')[0].textContent = `${weatherData.name} (${date})`;
    weatherIconEl.src = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    weatherIconEl.title = weatherData.weather[0].description;

    //populates weather information
    valueEl[0].textContent = tempConverted.toFixed(2) + ' °F';
    valueEl[1].textContent = speedConverted.toFixed(2) + ' MPH';
    valueEl[2].textContent = weatherData.main.humidity + '%';

    //save history
    updateCityHistoryWeather(weatherData);
    updateHistory(weatherData);
    localStorage.setItem('history', JSON.stringify(cityHistory));
}

//loads 5-day forecast information into html
function fiveDayWeather(forecastData) {
    //load data in html
    var forecastLiEl = document.querySelectorAll('#five-day-weather ol > li');
    var date = dayjs().format('M/D/YYYY');

    //loops through the 5 day forecast elements and fills
    for (var i = 0; i < forecastLiEl.length; i++) {
        var currentForecastUlEl = forecastLiEl[i].querySelectorAll('.value');
        var currentForecast = forecastData.list[i * 8 + 3]; // sets forecast to 9 am
        var iconSource = `http://openweathermap.org/img/wn/${currentForecast.weather[0].icon}@2x.png`;
        var tempConverted = (currentForecast.main.temp - 273.15) * 9 / 5 + 32;
        var speedConverted = currentForecast.wind.speed * 2.237

        //advances day by 1
        date = dayjs(date).add(1, 'day').format('M/D/YYYY');

        //populates date and weather img
        forecastLiEl[i].querySelector('h3').textContent = date;
        forecastLiEl[i].querySelector('img').src = iconSource;
        forecastLiEl[i].querySelector('img').title = currentForecast.weather[0].description;

        //populates weather information
        currentForecastUlEl[0].textContent = tempConverted.toFixed(2) + ' °F';
        currentForecastUlEl[1].textContent = speedConverted.toFixed(2) + ' MPH';
        currentForecastUlEl[2].textContent = currentForecast.main.humidity + '%';
    }

    //save history
    updateCityHistoryForecast(forecastData);
    localStorage.setItem('history', JSON.stringify(cityHistory));
}

function updateCityHistoryWeather(data) {
    var cityName = data.name;

    //loops through history array and checks if a city exists
    for (var i = 0; i < cityHistory.length; i++) {
        if (cityHistory[i].name == cityName) {
            cityHistory[i].current = data;
            return;
        }
    }

    //if it doesn't then makes object with data and push to array
    var tempObject = {
        name: cityName,
        current: data
    }

    cityHistory.push(tempObject);
}

function updateCityHistoryForecast(data) {
    var cityName = data.city.name;

    //loops through history array and checks if a city exists
    for (var i = 0; i < cityHistory.length; i++) {
        if (cityHistory[i].name == cityName) {
            cityHistory[i].forecast = data;
            return;
        }
    }

    //if it doesn't then makes object with data and push to array
    var tempObject = {
        name: cityName,
        forecast: data
    }

    cityHistory.push(tempObject);
}

function updateHistory(weatherData) {
    var history = [];
    var historyOlEl = document.querySelector('#history ol');
    historyOlEl.textContent = '';
    
    for (var i = 0; i < cityHistory.length; i++) {
        var listItem = document.createElement('li');
        listItem.textContent = cityHistory[i].name;
        historyOlEl.appendChild(listItem);

        history.push(cityHistory[i].name);
    }
}

function something(event) {
    var cityName = event.target.textContent;
    var index = -1;

    for(var i = 0; i < cityHistory.length; i++) {
        if(cityHistory[i].name == cityName){
            index = i;
            i = cityHistory.length;
            
            sameDayWeather(cityHistory[index].current);
            fiveDayWeather(cityHistory[index].forecast);
        }
    }
    
}


document.querySelector('#history ol').addEventListener('click', something);

onLoad();