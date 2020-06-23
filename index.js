express = require('express'),
    app = express(),
	http = require('http'),
	server = http.createServer(app),
	bodyparser = require('body-parser'),
	ip = require('ip'),
    chalk = require('chalk'),
    socketIO = require('socket.io'),
	io = socketIO(server),
	
	//socketUtils = require('./tools/socketUtils');
	logger = require('./tools/logger');
	

require('dotenv').config();
const env = process.env;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));
app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/netlify', 
(req, res, next) => {
	next();
}
,(req, res) => {
	console.log('Netlify Body: ', req.body);
	res.status(200).send('');
});

app.post('/heroku', (req, res) => {
	console.log('Heroku Body: ', req.body);
	res.status(200).send('');
});

app.get('/*', (req, res) => {
	res.status(200).send('Working!');
});

server.listen(env.PORT || 8080, function() {
    logger.clear();
    logger.log(true, 'Starting Server');
    logger.log(false, 'Server is running at', 
        chalk.blue('http://' + (env.IP || ip.address() || 'localhost') + ':' + (env.PORT || '8080')));
});
