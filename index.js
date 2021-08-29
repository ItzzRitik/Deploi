import express from 'express';
import http from 'http';
import ip from 'ip';
import chalk from 'chalk';
import jwt from 'jsonwebtoken';
import { Server as socketIO } from 'socket.io';
import crypto from 'crypto';
import { config as initEnv } from 'dotenv';

import { initSocket, notifySocket } from './tools/socketUtils.js';
import { initLogger } from './tools/logger.js';

initEnv();
initLogger();

let	app = express(),
	server = http.createServer(app),
	io = new socketIO(server),
	env = process.env;

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/lib', express.static('node_modules'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

let netlifySigned = (req, res, next) => {
	let signature = req.header('X-Webhook-Signature'),
		options = { iss: 'netlify', verify_iss: true, algorithm: 'HS256' },
		decodedHash = jwt.decode(signature, env.NETLIFY_KEY, true, options).sha256,
		bodyHash = crypto.createHash('sha256', decodedHash).update(JSON.stringify(req.body || '')).digest('hex');

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
	notifySocket(io, data);
	res.status(200).send('Thankyou for status update!');
});

app.post('/heroku', (req, res) => {
	let data = {
		service: 'Heroku',
		url: req.body.url,
		appName: req.body.app.charAt(0).toUpperCase() + req.body.app.substr(1).toLowerCase(),
	};
	notifySocket(io, data);
	res.status(200).send('Thankyou for status update!');
});

app.get('/*', (req, res) => {
	res.status(200).send('Server is Working!');
});

server.listen(env.PORT || 8080, function() {
	console.clear();
	console.log(true, 'Starting Server');
	console.log(false, 'Server is running at', 
		chalk.blue('http://' + (env.IP || ip.address() || 'localhost') + ':' + (env.PORT || '8080')));

	initSocket(io, () => {
		console.log(true, 'Socket initialized'); 
	});
});
