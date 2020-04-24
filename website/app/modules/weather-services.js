//Services
/*
The WeatherServicesSingleton has all the different variables and methods for the request and response of data to the Open Weather Map API
and the local-server.js. As a Singleton Creational Pattern Design there's only one instance of this object in the program, because no more
than one are needed. This helps to guarantee that there aren't unnecessary objects consuming memory during execution time.

Methods:
    - set
        Process: sets the apiKey, and baseApiURL for the Open Weather Map API, and the baseLocalServerURL for the local-server.js.
    - setHttpRequest
        Input: the HTTP method and body.
        Process: sets the options object for the http fetch request with the HTTP method and body.
    - getRequestAPI
        Input: the query to fetch.
        Process: async function to fetch a HTTP GET method from the API, and parse the response to JSON.
        Output: JSON object of the response data.
    - postRequestLocalServer:
        Input: the query to fetch.
        Process: async function to fetch a HTTP POST method to the local-server.js, and parse the confirmation response to JSON.
        Output: JSON object of the response confirmation.
    - queryWeatherByZipCode:
        Input: a zip code and a ISO country code.
        Process: defines the query that is needed to fetch the data from the API.
        Output: the query.
    - handleResponse:
        Input: a JSON response object and a callBack function.
        Process: if the response has a HTTP success code, the response is assigned as the weatherData and the callBack function is executed.
        If the response has a HTTP error code, then an error is thrown.
*/
export const WeatherServicesSingleton = (function() {
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
                        switch (true) {
                            case response.cod >= '200' && response.cod < '300':
                                if ('weather' in response) {
                                    this.weatherData = response;
                                }
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