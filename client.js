require('dotenv').config();
const env = process.env,
	notifier = require('node-notifier'),
	io = require('socket.io-client'),
	socket = io(env.SERVER_URL, { reconnect: true });
	
socket.on('connect', () => {   
	console.log('Connected');
});

socket.on('netlifyNotification', (build) => {
	console.log('Data', build);
	let payload = {
		title: 'Netlify',
		icon: './assets/netlify.png'
	};
	if (build.state == 'error') {
		payload['message'] = build.appName + ' build failed';
	}
	else if (build.state == 'ready') {
		payload['message'] = build.appName + ' build successful';
	}

	notifier.notify(payload);
});