require('dotenv').config();
const logger = require('./logger'),
	chalk = require('chalk'),
	notify = (io, data) => {
		if (data.service === 'Netlify') io.in('notificationRoom').emit('netlifyNotification', data);
		else if (data.service === 'Heroku') io.in('notificationRoom').emit('herokuNotification', data);
	},
	instances = {},
	initialize = (io, cb) => {
		io.on('connection', (socket) => {
			socket.on('join', (instance, cb) => {
				socket.join('notificationRoom');
				instances[socket.id] = instance;
				logger.log(false, chalk.green(instances[socket.id]) + ' (' + socket.id + ') connected');

				cb((socket.handshake.secure ? 'https://' : 'http://') + socket.handshake.headers.host);
			});
        
			socket.on('disconnect', () => {
				logger.log(false, chalk.red(instances[socket.id]) + ' (' + socket.id + ') disconnected');
			});
		});
		cb();
	};

module.exports = { initialize, notify };