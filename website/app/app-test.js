//Service

const baseURL = 'http://api.openweathermap.org/data/2.5/weather?';
const apiKey = '&appid=be40e6c98cb3c7bdec82f9dbba07c905';
let data = {};

function setHttpOptions(httpMethod, httpBodyData) {
    return {
        method: httpMethod,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(httpBodyData)
    };
}

const getRequestAPI = async(query) => {
    const response = await fetch(baseURL + query + apiKey);
    try {
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("error", error);
    }
};

const postRequestLocalServer = async(query, data = {}) => {
    const response = await fetch(query, setHttpOptions('POST', data));
    try {
        const newData = await response.json();
        return newData;
    } catch (error) {
        console.log("error", error);
    }
};

function currentWeatherByZipCode(zipCode, countryCode) {
    const query = `zip=${zipCode},${countryCode}`;
    return getRequestAPI(query);
}

function addWeatherFeelings(weather, feeling) {
    const query = 'http://localhost:8000/weather/post/addWeatherFeelings';
    return postRequestLocalServer(query, {...weather, feeling });
}

//Dynamic UI

function startMeasure() {
    return performance.now();
}

function stopMeasure(startingTime) {
    const endingTime = performance.now();
    console.log(`This code took ${endingTime - startingTime} milliseconds.`);
}

function getTimeZone() {
    const locationTimeZoneOffset = data.timezone;
    const date = new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);

    const locationDate = new Date(utc + locationTimeZoneOffset);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

    return locationDate.toLocaleDateString('en-US', options);
}

function setTopBar() {
    const location = document.querySelector('#location');
    const locationIcon = document.querySelector('#location-icon');
    location.textContent = data.name;
    locationIcon.style.display = 'block';
}

function setWeatherTemperature() {
    const [time, weatherIcon, temperature, feelsLike, weatherMain] = document.querySelectorAll(
        '#time, #weather-icon, #temperature, #feels-like, #weather-main'
    );
    const [maxTemperature, minTemperature] = document.querySelectorAll(
        '#max-temperature, #min-temperature'
    );

    time.textContent = getTimeZone();
    weatherIcon.setAttribute('src', './assets/icons/climate.svg');
    temperature.textContent = `${data.main.temp}°`;
    feelsLike.textContent = `Feels like ${data.main.feels_like}°`;
    weatherMain.textContent = data.weather[0].description;
    maxTemperature.textContent = `${data.main.temp_max}° max`;
    minTemperature.textContent = `${data.main.temp_min}° min`;
}

function setWeatherCardsA() {
    const cards = ['wind', 'clouds', 'rain', 'snow'];
    for (let card of cards) {
        if (card in data) {
            createWeatherCardA(property);
        }
    }
}

function weatherCardBFactory(callBack, cards) {
    let weatherCard = createWeatherCardB();
    for (let card of cards) {
        weatherCard = callBack(weatherCard, card);
    }
    buildWeatherCard(weatherCard);
}

function setWeatherCardsB() {
    let cards = ['pressure', 'sea_level', 'grnd_level'];
    weatherCardBFactory((weatherCard, card) => {
        if (card in data.main) {
            weatherCard = addWeatherCardProperty(weatherCard, property);
        }
        return weatherCard;
    }, cards);

    cards = ['humidity', 'sunrise', 'sunset'];
    weatherCardBFactory((weatherCard, card) => {
        if (card in data.sys || card in data.main) {
            weatherCard = addWeatherCardProperty(weatherCard, property);
        }
        return weatherCard;
    }, cards);
}

document.addEventListener('DOMContentLoaded', function() {
    currentWeatherByZipCode('94040', 'us').then(response => {
        data = response;
        setTopBar();
        setWeatherTemperature();
        setWeatherCardsA();
    });
});