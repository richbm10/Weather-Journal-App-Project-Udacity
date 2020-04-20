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
const iconsPath = './assets/icons/';
const icons = {
    'Rain': 'water.svg',
    'Wind': 'wind.svg',
    'Clouds': 'clouds.svg',
    'Sea Level': 'ocean.svg',
    'Ground Level': 'mountains.svg',
    'Humidity': 'water.svg',
    'Sunrise': 'sun.svg',
    'Sunset': 'sunset.svg',
    'Pressure': 'pressure.svg'
};

const weatherCardsA = new Set(['Rain', 'Wind', 'Clouds', 'Snow', 'Pressure']);

const setPageData = (response) => {
    data = response;
    console.log('data', data);
    setTopBar();
    setWeatherTemperature();
    setWeatherCardsA();
    setWeatherCardsB();
};

function deleteWeatherCards() {
    const cards = document.querySelectorAll('.weather-card');
    for (card of cards) {
        console.log(card.innerHTML);
        card.remove();
    }
}

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
    weatherIcon.setAttribute('src', `${iconsPath}climate.svg`);
    temperature.textContent = `${data.main.temp}°`;
    feelsLike.textContent = `Feels like ${data.main.feels_like}°`;
    weatherMain.textContent = data.weather[0].description;
    maxTemperature.textContent = `${data.main.temp_max}° max`;
    minTemperature.textContent = `${data.main.temp_min}° min`;
}

function addPipe(weatherCard) {
    const pipe = document.createElement('div');
    pipe.classList.add('pipe');
    weatherCard.appendChild(pipe);
    return weatherCard;
}

function addPropertyContent(propertyElement, property) {
    if (property === 'Sea Level' || property === 'Ground Level') {
        propertyElement.classList.add('container-top');
        const label = createElement('div');
        label.textContent = property;
        const tag = createElement('span');
        tag.textContent = '  Atmospheric Pressure';
        propertyElement.appendChild(label);
        propertyElement.appendChild(tag);
    } else {
        propertyElement.textContent = property;
    }
    return propertyElement;
}

function decorateWeatherCardProperty(weatherCard, property) {
    const div = document.createElement('div');
    div.classList.add('container-left');

    const icon = document.createElement('img');
    icon.classList.add('weather-card-icon');
    icon.setAttribute('src', iconsPath + icons[property]);
    div.appendChild(icon);

    const propertyElement = document.createElement('div');
    div.appendChild(addPropertyContent(propertyElement, property));

    weatherCard.appendChild(div);

    if (weatherCardsA.has(property)) {
        weatherCard = addPipe(weatherCard);
    }

    return weatherCard;
}

function addValue(weatherCard, tag, value) {
    const valueContainer = document.createElement('div');
    valueContainer.classList.add('container-top');

    const lable = document.createElement('span');
    lable.textContent = tag;

    valueContainer.appendChild(lable);
    valueContainer.appendChild(value);
    weatherCard.appendChild(valueContainer);

    return weatherCard;
}

function setColValues(property) {
    const valueColA = document.createElement('span');
    const valueColB = document.createElement('span');

    switch (property) {
        case 'Snow':
            valueColA.textContent = `${data.snow['1h']}%`;
            valueColB.textContent = `${data.snow['3h']}%`;
            break;
        case 'Rain':
            valueColA.textContent = `${data.rain['1h']}%`;
            valueColB.textContent = `${data.rain['3h']}%`;
            break;
        case 'Wind':
            valueColA.textContent = `${data.wind.speed} m/s`;
            valueColB.textContent = `${data.wind.deg}°`;
            break;
        default:
            break;
    }

    return [valueColA, valueColB];
}

function utcToLocalTime(utc) {
    return (new Date(utc * 1000)).toLocaleTimeString(); //From https://stackoverflow.com/users/2030565/jasen
}

function addRowValue(property) {
    const value = document.createElement('span');
    switch (property) {
        case 'Sea Level':
            value.textContent = `${data.main.sea_level} hPa`;
            break;
        case 'Ground Level':
            value.textContent = `${data.main.grnd_level} hPa`;
            break;
        case 'Humidity':
            value.textContent = `${data.main.humidity}%`;
            break;
        case 'Sunrise':
            value.textContent = utcToLocalTime(data.sys.sunrise);
            break;
        case 'Sunset':
            value.textContent = utcToLocalTime(data.sys.sunset);
            break;
        default:
            break;
    }

    return value;
}

function addColValues(weatherCard, property, ...values) {
    if (property === 'Wind') {
        weatherCard = addValue(weatherCard, 'speed', values[0]);
    } else {
        weatherCard = addValue(weatherCard, 'last 1h', values[0]);
    }

    weatherCard = addPipe(weatherCard);

    if (property === 'Wind') {
        weatherCard = addValue(weatherCard, 'direction', values[1]);
    } else {
        weatherCard = addValue(weatherCard, 'last 3h', values[1]);
    }
    return weatherCard;
}

function decorateDoubleCols(weatherCard, property) {
    const [valueColA, valueColB] = setColValues(property);
    weatherCard = addColValues(weatherCard, property, valueColA, valueColB);

    return weatherCard;
}

function decorateSingleCol(weatherCard, property) {
    const value = document.createElement('div');
    if (property === 'Clouds') {
        value.textContent = data.clouds.all + '%';
    }
    if (property === 'Pressure') {
        value.textContent = data.main.pressure + ' hPa';
    }

    weatherCard.appendChild(value);

    weatherCard.classList.add('weather-card-simple');

    return weatherCard;
}

function decorateSingleRow(weatherCard, property) {
    const value = addRowValue(property);
    weatherCard.appendChild(value);

    return weatherCard;
}

function decorateWeatherCardValues(weatherCard, property) {
    if (property === 'Rain' || property === 'Snow' || property === 'Wind') {
        weatherCard = decorateDoubleCols(weatherCard, property);
    }
    if (property === 'Clouds' || property === 'Pressure') {
        weatherCard = decorateSingleCol(weatherCard, property);
    }
    if (property === 'Humidity' || property === 'Sunrise' ||
        property === 'Sunset' || property === 'Sea Level' || property === 'Ground Level') {
        weatherCard = decorateSingleRow(weatherCard, property);
    }
    return weatherCard;
}

const toTitleCase = (phrase) => {
    return phrase
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

function decorateWeatherCardRow(weatherCard, property) {
    property = property.replace('_', ' ');
    property = toTitleCase(property);
    if (property === 'Grnd Level') {
        property = 'Ground Level';
    }
    weatherCard = decorateWeatherCardProperty(weatherCard, property);
    weatherCard = decorateWeatherCardValues(weatherCard, property);
    return weatherCard;
}

function createWeatherCard(type) {
    const weatherCard = document.createElement('div');
    weatherCard.classList.add('card', 'secondary-color');
    if (type === 'A') {
        weatherCard.classList.add('weather-card', 'container');
    }
    if (type === 'B') {
        weatherCard.classList.add('weather-card', 'container-top');
    }
    return weatherCard;
}

function buildHtmlMainElement(element) {
    document.querySelector('#main-content').appendChild(element);
}

function setWeatherCardsA() {
    const properties = ['wind', 'clouds', 'rain', 'snow', 'pressure'];
    for (let property of properties) {
        if (property in data || property in data.main) {
            let weatherCard = createWeatherCard('A');
            weatherCard = decorateWeatherCardRow(weatherCard, property);
            buildHtmlMainElement(weatherCard);
        }
    }
}

function createWeatherCardRow() {
    const row = document.createElement('div');
    row.classList.add('container', 'weather-card-row');
    return row;
}

function setWeatherCardB(weatherCard, properties) {
    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        row = decorateWeatherCardRow(createWeatherCardRow(), property);
        weatherCard.appendChild(row);

        if (i < properties.length - 1) {
            const div = document.createElement('div');
            div.classList.add('container');
            const div1 = document.createElement('div');
            const div2 = document.createElement('div');
            div1.classList.add('row-line');
            div2.classList.add('row-line');
            div.appendChild(div1);
            div.appendChild(div2);
            weatherCard.appendChild(div);
        }
    }
    return weatherCard;
}

function setWeatherCardsB() {
    let weatherCard;
    if ('sea_level' in data.main || 'grnd_level' in data.main) {
        weatherCard = createWeatherCard('B');
        weatherCard = setWeatherCardB(weatherCard, ['sea_level', 'grnd_level']);
        buildHtmlMainElement(weatherCard);
    }

    if ('humidity' in data.main || 'sunrise' in data.sys || 'sunset' in data.sys) {
        weatherCard = createWeatherCard('B');
        weatherCard = setWeatherCardB(weatherCard, ['humidity', 'sunrise', 'sunset']);
        buildHtmlMainElement(weatherCard);
    }
}

const activateAlert = () => {
    const main = document.querySelector('#main');
    main.style.opacity = '0.2';
    const alert = document.querySelector('#zip-code-alert');
    alert.classList.remove('unactive-zip-code-alert');
    alert.classList.add('active-zip-code-alert');
}

const deactivateAlert = () => {
    const main = document.querySelector('#main');
    main.style.opacity = '1';
    const alert = document.querySelector('#zip-code-alert');
    alert.classList.remove('active-zip-code-alert');
    alert.classList.add('unactive-zip-code-alert');
};

function setChangeLocationListener() {
    document.querySelector('#close').addEventListener('click', deactivateAlert);

    document.querySelector('#enter').addEventListener('click', () => {
        deleteWeatherCards();
        deactivateAlert();
        const zipCodeAlertForm = document.querySelector('#zip-code-alert-form');
        const zipCode = zipCodeAlertForm.zipCode.value;
        const countryCode = zipCodeAlertForm.countryCode.value;
        currentWeatherByZipCode(zipCode, countryCode).then(setPageData);
    });

    document.querySelector('#change-location').addEventListener('click', activateAlert);
}

document.addEventListener('DOMContentLoaded', function() {
    setChangeLocationListener();
    currentWeatherByZipCode('94040', 'us').then(setPageData);
});