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

const server = app.listen(port, () => {
    console.log('Server running..');
    console.log(`localhost: ${port}`);
});

const projectData = {};

app.get('/', function(request, response) {
    response.send('hello world')
});

app.get('/all', function(request, response) {
    response.send(projectData)
});

app.post('/weather/post/addWeatherFeelings', function(request, response) {
    addProjectData(request.body);
});

function addProjectData(data) {
    if (data.id in projectData) {
        projectData[data.id].feelings.push(data.feeling);
    } else {
        const weather = Object.assign({}, data);
        weather.feelings = [weather.feeling];
        delete weather.feeling;
        console.log(weather);
        projectData[data.id] = weather;
    }
}