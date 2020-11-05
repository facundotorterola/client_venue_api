const express = require('express');
const bodyParser = require('body-parser');

const client = require('./components/client/network');
const venue = require('./components/venue/network');

const app = express();

const errors = require('../network/errors');

app.use(bodyParser.json());

app.use('/api/client', client);
app.use('/api/venue', venue);

// Error Handler
app.use(errors);

module.exports = app;
