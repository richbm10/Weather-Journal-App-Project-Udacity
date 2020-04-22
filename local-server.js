// Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

/* Dependencies */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

/* Initializing the main project folder */
app.use(express.static('./website'));

const port = 8000;

function logActiveServer() {
    console.log('Server running..');
    console.log(`localhost: ${port}`);
}

const server = app.listen(port, () => {
    logActiveServer();
});

const projectData = {};

const confirmationMessage = {
    cod: 200,
    message: 'Success'
};

app.get('/all', (request, response) => {
    response.send(projectData);
    logActivatedService('HTTP GET Service: /all', request.body, projectData);
});

app.post('/weather/post/addWeatherFeelings', (request, response) => {
    addProjectData(request.body);
    response.send(confirmationMessage);
    logActivatedService('\nHTTP POST Service: /weather/post/addWeatherFeelings', request.body, confirmationMessage);
});

function addProjectData(data) {
    if (data.sys.id in projectData) {
        projectData[data.sys.id].feelings.push(data.feeling);
    } else {
        const weather = Object.assign({}, data);
        weather.allFeelings = [weather.feelings];
        delete weather.feelings;
        projectData[data.sys.id] = weather;
    }
}

function logActivatedService(service, requestLog, responseLog) {
    console.log(service);
    console.log('\nBody Request:\n', requestLog);
    console.log('\nBody Response:\n', responseLog);
    logActiveServer();
}