require('dotenv').config();
const logger = require('./logger'),
	chalk = require('chalk'),
	notify = (io, data) => {
		if (data.service === 'Netlify') io.in('notificationRoom').emit('netlifyNotification', data);
		else if (data.service === 'Heroku') io.in('notificationRoom').emit('herokuNotification', data);
	},
	initialize = (io, cb) => {
		io.on('connection', (socket) => {
			socket.join('notificationRoom');
        
			socket.on('disconnect', () => {
				logger.log(true, 'Client disconnected: ', chalk.red(socket.id));
			});
		});
		cb();
	};

module.exports = { initialize, notify };