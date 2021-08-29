import chalk from 'chalk';
import { config as initEnv } from 'dotenv';
initEnv();

const notifySocket = (io, data) => {
		if (data.service === 'Netlify') io.in('notificationRoom').emit('netlifyNotification', data);
		else if (data.service === 'Heroku') io.in('notificationRoom').emit('herokuNotification', data);
	},
	instances = {},
	initSocket = (io, cb) => {
		io.on('connection', (socket) => {
			socket.on('join', (instance, cb) => {
				socket.join('notificationRoom');
				instances[socket.id] = instance;
				console.log(false, chalk.green(instances[socket.id]) + ' (' + socket.id + ') connected');

				cb((socket.handshake.secure ? 'https://' : 'http://') + socket.handshake.headers.host);
			});
        
			socket.on('disconnect', () => {
				console.log(false, chalk.red(instances[socket.id]) + ' (' + socket.id + ') disconnected');
			});
		});
		cb();
	};

export { initSocket, notifySocket };