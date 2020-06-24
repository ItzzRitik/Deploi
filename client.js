require('dotenv').config();
let env = process.env,
	opn = require('opn'),
	notifier = require('node-notifier'),
	chalk = require('chalk'),
	logger = require('./tools/logger'),
	io = require('socket.io-client'),
	socket = io(env.SERVER_URL, { reconnect: true }),
	connecting = null,
	consoleLoader = (msg) => {
		let x = 0, 
			load = ['⠁ ', '⠈ ', ' ⠁', ' ⠈', ' ⠐', ' ⠠', ' ⢀', ' ⡀', '⢀ ', '⡀ ', '⠄ ', '⠂ '];
		return setInterval(() => {
			logger.stdout('\r' + msg + ' ' + load[x = (++x < load.length) ? x : 0]);
		}, 50);
	},
	initSocket = () => {
		socket.on('connect', () => {   
			socket.emit('join', 'Node Terminal', (host) => {
				clearInterval(connecting);
				logger.stdout('\033[A\33[2K\r');
				logger.log(true, 'Connected to ', chalk.blue(host));
				logger.log(true, 'Notifications:\n');
			});
		});
		
		socket.on('netlifyNotification', (build) => {
			let payload = {
				title: 'Netlify',
				icon: './assets/netlify.png',
				sound: 'Bottle',
				closeLabel: 'Open App',
				actions: 'Open Build'
			};
			if (build.state == 'building') {
				payload['message'] = build.appName + ' build started';
				logger.log(false, chalk.bgWhite.black(' Netlify ') + ' : ' + chalk.blue(payload.message));
			}
			else if (build.state == 'ready') {
				payload['sound'] = 'Submarine';
				payload['message'] = build.appName + ' build successful';
				logger.log(false, chalk.bgWhite.black(' Netlify ') + ' : ' + chalk.green(payload.message));
			}
			else if (build.state == 'error') {
				payload['sound'] = 'Basso';
				payload['message'] = build.appName + ' build failed';
				logger.log(false, chalk.bgWhite.black(' Netlify ') + ' : ' + chalk.red(payload.message));
			}
		
			notifier.notify(payload, (error, response) => {
				if (response === 'activate') {
					opn(build.url);
				}
				else if (response === 'closed') {
					opn(build.appUrl);
				}
			});
		});
	};

logger.clear();
connecting = consoleLoader('Connecting To Server');
initSocket();

	
