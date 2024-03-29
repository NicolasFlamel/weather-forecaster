let cityHistory = JSON.parse(localStorage.getItem('history')) || [];

// TODO: validate date of weather history

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

async function onLoad() {
  try {
    const response = await fetch('https://api.db-ip.com/v2/free/self');
    const data = await response.json();
    citySearch({ target: { value: data.city } });
  } catch (err) {
    citySearch({ target: { value: 'sacramento' } });
  }
}

async function citySearch(event) {
  const searchTerm = event.target.value;

  if (searchTerm.length < 1) return;

  const coord = await getCoord(searchTerm);
  getWeatherAt(coord);
}

async function geoLocate(event) {
  navigator.geolocation.getCurrentPosition(geoSuccess, geoFailure);
}

function geoSuccess({ coords: { latitude, longitude } }) {
  getWeatherAt({ lat: latitude, lon: longitude });
}

function geoFailure(error) {
  console.log(error);
}

function historySelect(event) {
  const cityName = event.target.textContent;

  for (let i = 0; i < cityHistory.length; i++) {
    if (cityHistory[i].name == cityName) {
      updateSameDayWeather(cityHistory[i].current);
      updatedForecast(cityHistory[i].forecast);
      break;
    }
  }
}

async function getCoord(city) {
  const key = '15dca0d0b372553e6b4758c35f61904a';
  const url = new URL(
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${key}`
  );

  const response = await fetch(url);

  if (!response.ok) {
    createAlert();
    return Promise.reject(response);
  }

  const data = await response.json();

  if (data.length == 0) return createAlert();

  return { lat: data[0].lat, lon: data[0].lon };
}

async function getWeatherAt({ lat, lon }) {
  const key = '15dca0d0b372553e6b4758c35f61904a';

  const data = await Promise.all([
    getWeatherAPI(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`
    ),
    getWeatherAPI(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}`
    ),
  ]);

  updateSameDayWeather(data[0]);
  updatedForecast(data[1]);
}

async function getWeatherAPI(url) {
  const response = await fetch(url);

  if (!response.ok) return alert('failed');

  return response.json();
}

//load same-day weather information into html
function updateSameDayWeather(weatherData) {
  const weatherEl = document.querySelector('#present-weather');
  const weatherIconEl = document.querySelector('#present-weather > img');
  const valueEl = document.querySelectorAll('#present-weather .value');
  const date = dayjs().format('M/D/YYYY');
  //converts to imperial units
  const tempConverted = ((weatherData.main.temp - 273.15) * 9) / 5 + 32;
  const speedConverted = weatherData.wind.speed * 2.237;

  //populates city name, date and weather img
  weatherEl.getElementsByTagName(
    'h2'
  )[0].textContent = `${weatherData.name} (${date})`;
  weatherIconEl.src = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
  weatherIconEl.title = weatherData.weather[0].description;

  //populates weather information
  valueEl[0].textContent = tempConverted.toFixed(2) + ' °F';
  valueEl[1].textContent = speedConverted.toFixed(2) + ' MPH';
  valueEl[2].textContent = weatherData.main.humidity + '%';

  //save history
  updateCityHistoryWeather(weatherData);
  updateHistory();
  localStorage.setItem('history', JSON.stringify(cityHistory));
}

//loads 5-day forecast information into html
function updatedForecast(forecastData) {
  //load data in html
  const forecastLiEl = document.querySelectorAll('#five-day-weather ol > li');
  let date = dayjs().format('M/D/YYYY');

  //loops through the 5 day forecast elements and fills
  for (let i = 0; i < forecastLiEl.length; i++) {
    const currentForecastUlEl = forecastLiEl[i].querySelectorAll('.value');
    const currentForecast = forecastData.list[i * 8 + 3]; // sets forecast to 9 am
    const iconSource = `http://openweathermap.org/img/wn/${currentForecast.weather[0].icon}@2x.png`;
    const tempConverted = ((currentForecast.main.temp - 273.15) * 9) / 5 + 32;
    const speedConverted = currentForecast.wind.speed * 2.237;

    //advances day by 1
    date = dayjs(date).add(1, 'day').format('M/D/YYYY');

    //populates date and weather img
    forecastLiEl[i].querySelector('h3').textContent = date;
    forecastLiEl[i].querySelector('img').src = iconSource;
    forecastLiEl[i].querySelector('img').title =
      currentForecast.weather[0].description;

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
  const cityName = data.name;

  //loops through history array and checks if a city exists
  for (let i = 0; i < cityHistory.length; i++) {
    if (cityHistory[i].name == cityName) {
      cityHistory[i].current = data;
      return;
    }
  }

  //if it doesn't then makes object with data and push to array
  const tempObject = {
    name: cityName,
    current: data,
  };

  cityHistory.push(tempObject);
}

function updateCityHistoryForecast(data) {
  const cityName = data.city.name;

  //loops through history array and checks if a city exists
  for (let i = 0; i < cityHistory.length; i++) {
    if (cityHistory[i].name == cityName) {
      cityHistory[i].forecast = data;
      return;
    }
  }

  //if it doesn't then makes object with data and push to array
  const tempObject = {
    name: cityName,
    forecast: data,
  };

  cityHistory.push(tempObject);
}

function updateHistory() {
  const history = [];
  const historyOlEl = document.querySelector('#history ol');
  historyOlEl.textContent = '';

  for (let i = 0; i < cityHistory.length; i++) {
    const listItem = document.createElement('li');
    listItem.textContent = cityHistory[i].name;
    historyOlEl.appendChild(listItem);

    history.push(cityHistory[i].name);
  }
}

// alert of failed search
function createAlert() {
  const divEl = document.createElement('div');
  const asideEl = document.querySelector('aside');
  const alertHtml =
    '<strong>Error!</strong> Could not find that city name. <button type = "button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

  divEl.setAttribute(
    'class',
    'alert alert-warning alert-dismissible fade show'
  );
  divEl.setAttribute('role', 'alert');
  divEl.innerHTML = alertHtml;
  asideEl.insertBefore(divEl, document.querySelector('#search'));
}

document.querySelector('#city-input').addEventListener('search', citySearch);
document.querySelector('#history ol').addEventListener('click', historySelect);
document.querySelector('.geo-button').addEventListener('click', geoLocate);

onLoad();
