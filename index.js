let express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	bodyparser = require('body-parser'),
	ip = require('ip'),
	chalk = require('chalk'),
	jwt = require('jsonwebtoken'),
	socketIO = require('socket.io'),
	io = socketIO(server),
	crypto = require('crypto'),
	
	socketUtils = require('./tools/socketUtils'),
	logger = require('./tools/logger');
	

require('dotenv').config();
const env = process.env;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

let netlifySigned = (req, res, next) => {
	let signature = req.header('X-Webhook-Signature'),
		options = { iss: 'netlify', verify_iss: true, algorithm: 'HS256' },
		decodedHash = jwt.decode(signature, env.NETLIFY_KEY, true, options).sha256,
		bodyHash = crypto.createHash('sha256', decodedHash).update(JSON.stringify(req.body)).digest('hex');
	
	if (decodedHash !== bodyHash) {
		return res.status(403).send('Please provide a valid webhook signature!');
	}
	
	next();
};

app.post('/netlify', netlifySigned, (req, res) => {
	let data = {
		service: 'Netlify',
		id: req.body.id,
		url: `https://app.netlify.com/sites/${req.body.name.toLowerCase()}/deploys/${req.body.id}`,
		state: req.body.state,
		appName: req.body.name.charAt(0).toUpperCase() + req.body.name.substr(1).toLowerCase(),
		appUrl: req.body.url
	};
	socketUtils.notify(io, data);
	res.status(200).send('Thankyou for status update!');
});

app.post('/heroku', (req, res) => {
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
	socketUtils.initialize(io, () => {
		logger.log(true, 'Socket initialized'); 
	});
});
