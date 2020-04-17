const baseURL = 'http://api.openweathermap.org/data/2.5/weather?';
const apiKey = '&appid=be40e6c98cb3c7bdec82f9dbba07c905';

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

function currentWeatherByZipCode(zipCode, countryCode) {
    const query = `zip=${zipCode},${countryCode}`;
    return getRequestAPI(query);
}

function addWeatherFeelings(weather, feeling) {
    const query = 'http://localhost:8000/weather/post/addWeatherFeelings';
    return postRequestLocalServer(query, {...weather, feeling });
}

const getRequestAPI = async(query) => {
    const response = await fetch(baseURL + query + apiKey);
    try {
        const data = await response.json();
        console.log(data)
        return data;
    } catch (error) {
        console.log("error", error);
    }
};

const postRequestLocalServer = async(query, data = {}) => {
    const response = await fetch(query, setHttpOptions('POST', data));
    try {
        const newData = await response.json();
        console.log(newData);
        return newData;
    } catch (error) {
        console.log("error", error);
    }
};

currentWeatherByZipCode('94040', 'us').then((response) => {
    addWeatherFeelings(response, 'I feel good');
});