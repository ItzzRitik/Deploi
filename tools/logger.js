let call = 0;
const getPrefix = (title) => {
		if (title == null) {
			return title;
		}

		if (typeof title === 'boolean') {
			return title ? '\n' + ++call + ') ' : '⪢   ';
		}

		if (typeof title === 'object') {
			if (title.type === 'CONSOLESUCCESS' || title.type === 'CONSOLEERROR') {
				return title.value + '  ';
			}
		}

		return title;
	},
	logger = (legacyConsole) => {
		return {
			log: (...args) => {
				args[0] = getPrefix(args[0]);
				legacyConsole.log(...args);
			},
			dir: (...args) => {
				args[0] = getPrefix(args[0]);
				legacyConsole.dir(...args);
			},
			info: (...args) => {
				args[0] = getPrefix(args[0]);
				legacyConsole.info(...args);
			},
			warn: (...args) => {
				args[0] = getPrefix(args[0]);
				legacyConsole.warn(...args);
			},
			error: (...args) => {
				args[0] = getPrefix(args[0]);
				legacyConsole.error(...args);
			},
			trace: (...args) => {
				args[0] = getPrefix(args[0]);
				legacyConsole.trace(...args);
			},
			moveCursor: (...args) => {
				process?.stdout?.moveCursor && process.stdout.moveCursor(...args);
			},
			stdout: (...args) => {
				process.stdout.write(...args);
			},
			clear: () => {
				legacyConsole.clear();
			}
		};
	},

	initLogger = () => {
		console = logger(console);
	};

export { initLogger };