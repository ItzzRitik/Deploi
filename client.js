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
				actions: 'Open App'
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
		
			notifier.notify(payload, (error, response, metadata) => {
				if (metadata.activationType === 'contentsClicked') {
					opn(build.url);
				}
				else if (metadata.activationType === 'actionClicked') {
					opn(build.appUrl);
				}
			});
		});

		socket.on('herokuNotification', (build) => {
			let payload = {
				title: 'Heroku',
				message: build.appName + ' build successful',
				icon: './assets/heroku.png',
				sound: 'Submarine',
				actions: 'Open App',
			};

			logger.log(false, chalk.bgWhite.black(' Heroku  ') + ' : ' + chalk.green(payload.message));

			notifier.notify(payload, (error, response) => {
				if (response === 'activate' || response === 'closed') {
					opn(build.url);
				}
			});
		});
	};

logger.clear();
connecting = consoleLoader('Connecting To Server');
initSocket();

	
