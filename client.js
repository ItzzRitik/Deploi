require('dotenv').config();
const env = process.env,
	opn = require('opn'),
	notifier = require('node-notifier'),
	io = require('socket.io-client'),
	socket = io(env.SERVER_URL, { reconnect: true });
	
socket.on('connect', () => {   
	socket.emit('join', 'Node Terminal', () => {
		console.log('Connected to ', env.SERVER_URL);
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
	}
	else if (build.state == 'ready') {
		payload['sound'] = 'Submarine';
		payload['message'] = build.appName + ' build successful';
	}
	else if (build.state == 'error') {
		payload['sound'] = 'Basso';
		payload['message'] = build.appName + ' build failed';
	}

	notifier.notify(payload, (error, response) => {
		console.log(response);
		if (response === 'activate') {
			opn(build.url);
		}
		else if (response === 'closed') {
			opn(build.appUrl);
		}
	});
});