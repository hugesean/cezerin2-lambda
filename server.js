var express = require('express');
var cors = require('cors')
var bodyParser  = require('body-parser');
var _ = require('lodash');
var apiRouter = express.Router();
var ajaxRouter = express.Router();
var port = process.env.PORT;
var app = express();

app.use(cors());
app.use(bodyParser.json());


apiRouter.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

ajaxRouter.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

console.log('[SERVER] Initializing routes');
require('./src/apiRouter')(app,apiRouter);
require('./src/ajaxRouter')(app,ajaxRouter);

app.use('/api',apiRouter);
app.use('/ajax',ajaxRouter);

module.exports = app;