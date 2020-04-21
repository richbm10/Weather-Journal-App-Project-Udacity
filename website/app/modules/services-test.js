const WeatherServicesSingleton = (function() {
    let instance;
    return {
        getInstance: () => {
            if (!instance) {
                instance = {
                    apiKey: '',
                    baseApiURL: '',
                    baseLocalServerURL: '',
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
                        switch (true) {
                            case response.cod >= '200' && response.cod < '300':
                                callBack(response);
                                break;
                            case response.cod >= '400' && response.cod < '500':
                                throw response.message;
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

WeatherServicesSingleton.getInstance().set('&appid=be40e6c98cb3c7bdec82f9dbba07c905', 'http://api.openweathermap.org/data/2.5/weather?', 'http://localhost:8000');