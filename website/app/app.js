//Services
const WeatherServicesSingleton = (function() {
    let instance;
    return {
        getInstance: () => {
            if (!instance) {
                instance = {
                    apiKey: '',
                    baseApiURL: '',
                    baseLocalServerURL: '',
                    weatherData: {},
                    set: function(pApiKey, pBaseApiURL, pBaseLocalServerURL) {
                        this.apiKey = pApiKey;
                        this.baseApiURL = pBaseApiURL;
                        this.baseLocalServerURL = pBaseLocalServerURL;
                    },
                    setHttpRequest: function(httpMethod, httpBodyData) {
                        return {
                            method: httpMethod,
                            credentials: 'same-origin',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(httpBodyData)
                        };
                    },
                    getRequestAPI: async function(query) {
                        const response = await fetch(this.baseApiURL + query + this.apiKey);
                        try {
                            const data = await response.json();
                            return data;
                        } catch (error) {
                            console.log("error", error);
                        }
                    },
                    postRequestLocalServer: async function(query, data = {}) {
                        const response = await fetch(this.baseLocalServerURL + query, this.setHttpRequest('POST', data));
                        try {
                            const resData = await response.json();
                            return resData;
                        } catch (error) {
                            console.log("error", error);
                        }
                    },
                    queryWeatherByZipCode: function(zipCode, countryCode) {
                        return `zip=${zipCode},${countryCode}`;
                    },
                    queryAddWeatherFeelings: '/weather/post/addWeatherFeelings',
                    handleResponse: function(response, callBack) {
                        response.cod = `${response.cod}`;
                        this.weatherData = response;
                        switch (true) {
                            case response.cod >= '200' && response.cod < '300':
                                callBack();
                                break;
                            case response.cod >= '400' && response.cod < '500':
                                throw `${response.cod} ${response.message}`;
                            default:
                                break;
                        }
                    }
                };
            }
            return instance;
        }
    };
})();

const webServices = WeatherServicesSingleton.getInstance();
webServices.set('&appid=be40e6c98cb3c7bdec82f9dbba07c905', 'http://api.openweathermap.org/data/2.5/weather?', 'http://localhost:8000');

//Dynamic HTML

const iconsPath = './assets/icons/';
const icons = {
    'Snow': 'snow.svg',
    'Rain': 'water.svg',
    'Wind': 'wind.svg',
    'Haze': 'haze.svg',
    'Clear': 'clear.svg',
    'Clouds': 'clouds.svg',
    'Sea Level': 'ocean.svg',
    'Ground Level': 'mountains.svg',
    'Humidity': 'water.svg',
    'Sunrise': 'sun.svg',
    'Sunset': 'sunset.svg',
    'Pressure': 'pressure.svg',
    'Extreme': 'extreme-weather.svg'
};

const weatherCardsA = new Set(['Rain', 'Wind', 'Clouds', 'Snow', 'Pressure']);

//Dynamic HTML-General Functions

function utcToLocalTime(utc) {
    return (new Date(utc * 1000)).toLocaleTimeString(); //From https://stackoverflow.com/users/2030565/jasen
}

const toTitleCase = (phrase) => {
    return phrase
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

function getTimeZone() {
    const locationTimeZoneOffset = webServices.weatherData.timezone;
    const date = new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);

    const locationDate = new Date(utc + locationTimeZoneOffset);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };

    return locationDate.toLocaleDateString('en-US', options);
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

function validateValue(value) {
    if (value === undefined) {
        return '';
    }
    return value;
}

function addRowValue(property) {
    const value = document.createElement('span');
    switch (property) {
        case 'Sea Level':
            value.textContent = `${webServices.weatherData.main.sea_level} hPa`;
            break;
        case 'Ground Level':
            value.textContent = `${webServices.weatherData.main.grnd_level} hPa`;
            break;
        case 'Humidity':
            value.textContent = `${webServices.weatherData.main.humidity}%`;
            break;
        case 'Sunrise':
            value.textContent = utcToLocalTime(webServices.weatherData.sys.sunrise);
            break;
        case 'Sunset':
            value.textContent = utcToLocalTime(webServices.weatherData.sys.sunset);
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

function setColValues(property) {
    const valueColA = document.createElement('span');
    const valueColB = document.createElement('span');

    switch (property) {
        case 'Snow':
            valueColA.textContent = `${validateValue(webServices.weatherData.snow['1h'])}%`;
            valueColB.textContent = `${validateValue(webServices.weatherData.snow['3h'])}%`;
            break;
        case 'Rain':
            valueColA.textContent = `${validateValue(webServices.weatherData.rain['1h'])}%`;
            valueColB.textContent = `${validateValue(webServices.weatherData.rain['3h'])}%`;
            break;
        case 'Wind':
            valueColA.textContent = `${validateValue(webServices.weatherData.wind.speed)} m/s`;
            valueColB.textContent = `${validateValue(webServices.weatherData.wind.deg)}°`;
            break;
        default:
            break;
    }

    return [valueColA, valueColB];
}

//Dynamic HTML-Weather Cards Decorators

function decorateDoubleCols(weatherCard, property) {
    const [valueColA, valueColB] = setColValues(property);
    weatherCard = addColValues(weatherCard, property, valueColA, valueColB);

    return weatherCard;
}

function decorateSingleCol(weatherCard, property) {
    const value = document.createElement('div');
    if (property === 'Clouds') {
        value.textContent = webServices.weatherData.clouds.all + '%';
    }
    if (property === 'Pressure') {
        value.textContent = webServices.weatherData.main.pressure + ' hPa';
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

function decorateWeatherCard(weatherCard, property) {
    property = property.replace('_', ' ');
    property = toTitleCase(property);
    if (property === 'Grnd Level') {
        property = 'Ground Level';
    }
    weatherCard = decorateWeatherCardProperty(weatherCard, property);
    weatherCard = decorateWeatherCardValues(weatherCard, property);
    return weatherCard;
}

//Dynamic HTML-Weather Card Creators

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

function createWeatherCardRow() {
    const row = document.createElement('div');
    row.classList.add('container', 'weather-card-row');
    return row;
}

//Dynamic HTML-Builder

function buildHtmlMainElement(element) {
    document.querySelector('#references').insertAdjacentHTML('beforebegin', element.outerHTML);
}

//Dynamic HTML-Set or Reset Page Content

function setTopBar() {
    const location = document.querySelector('#location');
    const locationIcon = document.querySelector('#location-icon');
    location.textContent = webServices.weatherData.name;
    locationIcon.style.display = 'block';
}

function resetTopBar() {
    const location = document.querySelector('#location');
    location.textContent = '';
}

function setWeatherTemperature() {
    const [time, weatherIcon, temperature, feelsLike, weatherMain] = document.querySelectorAll(
        '#time, #weather-icon, #temperature, #feels-like, #weather-main'
    );
    const [maxTemperature, minTemperature] = document.querySelectorAll(
        '#max-temperature, #min-temperature'
    );

    time.textContent = getTimeZone();
    const iconName = webServices.weatherData.weather[0].main;
    let icon = 'climate.svg';
    if (iconName in icons) {
        icon = icons[iconName];
    }
    weatherIcon.setAttribute('src', iconsPath + icon);
    temperature.textContent = `${webServices.weatherData.main.temp}°`;
    feelsLike.textContent = `Feels like ${webServices.weatherData.main.feels_like}°`;
    weatherMain.textContent = webServices.weatherData.weather[0].description;
    maxTemperature.textContent = `${webServices.weatherData.main.temp_max}° max`;
    minTemperature.textContent = `${webServices.weatherData.main.temp_min}° min`;
}

function resetWeatherTemperature() {
    const elements = document.querySelectorAll(
        '#time, #temperature, #feels-like, #weather-main, #max-temperature, #min-temperature'
    );
    document.querySelector('#weather-icon').removeAttribute('src');
    for (let element of elements) {
        element.textContent = '';
    }
}

function setWeatherCardsA() {
    const properties = ['wind', 'clouds', 'rain', 'snow', 'pressure'];
    for (let property of properties) {
        if (property in webServices.weatherData || property in webServices.weatherData.main) {
            let weatherCard = createWeatherCard('A');
            weatherCard = decorateWeatherCard(weatherCard, property);
            buildHtmlMainElement(weatherCard);
        }
    }
}

function setWeatherCardB(weatherCard, properties) {
    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        row = decorateWeatherCard(createWeatherCardRow(), property);
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
    if ('sea_level' in webServices.weatherData.main || 'grnd_level' in webServices.weatherData.main) {
        weatherCard = createWeatherCard('B');
        weatherCard = setWeatherCardB(weatherCard, ['sea_level', 'grnd_level']);
        buildHtmlMainElement(weatherCard);
    }

    if ('humidity' in webServices.weatherData.main || 'sunrise' in webServices.weatherData.sys || 'sunset' in webServices.weatherData.sys) {
        weatherCard = createWeatherCard('B');
        weatherCard = setWeatherCardB(weatherCard, ['humidity', 'sunrise', 'sunset']);
        buildHtmlMainElement(weatherCard);
    }
}

const setPageData = () => {
    resetPageData();
    setTopBar();
    setWeatherTemperature();
    setWeatherCardsA();
    setWeatherCardsB();
};

function resetPageData() {
    resetTopBar();
    resetWeatherTemperature();
    const cards = document.querySelectorAll('.weather-card');
    for (let card of cards) {
        card.remove();
    }
}

//Dynamic HTML-Alert

function activateAlert(alert) {
    const main = document.querySelector('#main');
    main.style.opacity = '0.2';
    alert.classList.remove('unactive-alert');
    alert.classList.add('active-alert');
}

function activateMessageAlert(message) {
    document.querySelector('#alert-message').textContent = `${toTitleCase(message)}`;
    activateAlert(document.querySelector('#alert'));
}

const deactivateAlert = () => {
    const main = document.querySelector('#main');
    main.style.opacity = '1';
    const alerts = document.querySelectorAll('#zip-code-alert, #alert');
    for (let alert of alerts) {
        alert.classList.remove('active-alert');
        alert.classList.add('unactive-alert');
    }
};

//Dynamic HTML-Event Listeners

function setGenerateListener() {
    document.querySelector('#generate').addEventListener('click', () => {
        const feelingsForm = document.querySelector('#feelings-form');
        const feelings = feelingsForm.feelings.value;

        const query = webServices.queryAddWeatherFeelings;

        webServices.postRequestLocalServer(query, {...webServices.weatherData, feelings }).then((response) => {
            try {
                webServices.handleResponse(response, () => {
                    feelingsForm.feelings.value = '';
                    activateMessageAlert('Weather Personal Feelings Submitted');
                });
            } catch (error) {
                activateMessageAlert(error);
            }
        }).catch(() => {
            activateMessageAlert('503 Server Error Connection');
        });
    });
}

function setChangeLocationListener() {
    document.querySelector('#close-zip-code').addEventListener('click', deactivateAlert);

    document.querySelector('#enter-zip-code').addEventListener('click', () => {
        deactivateAlert();
        const zipCodeAlertForm = document.querySelector('#zip-code-alert-form');
        const zipCode = zipCodeAlertForm.zipCode.value;
        const countryCode = zipCodeAlertForm.countryCode.value;

        const query = webServices.queryWeatherByZipCode(zipCode, countryCode);
        webServices.getRequestAPI(query).then((response) => {
            try {
                webServices.handleResponse(response, setPageData);
            } catch (error) {
                activateMessageAlert(error);
            }
        }).catch(() => {
            activateMessageAlert('503 Server Error Connection');
        });
    });

    document.querySelector('#change-location').addEventListener('click', () => {
        activateAlert(document.querySelector('#zip-code-alert'));
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setGenerateListener();
    setChangeLocationListener();
    document.querySelector('#alert-close').addEventListener('click', deactivateAlert);

    const zipCodeAlertForm = document.querySelector('#zip-code-alert-form');
    zipCodeAlertForm.zipCode.value = ''; //94040
    zipCodeAlertForm.countryCode.value = 'us';

    activateAlert(document.querySelector('#zip-code-alert'));
});