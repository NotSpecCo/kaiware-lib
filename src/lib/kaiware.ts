import { LogLevel, MessageType } from '../enums';
import { Config } from '../types';
import { parseError } from '../utils';
import { Connection } from './connection';

export class Kaiware {
	private config: Config;
	private connection: Connection | null = null;
	cleanConsole: Console = console;

	constructor(config: Partial<Config> & { address: string; port: number }) {
		this.config = {
			deviceId: 'kaios-device',
			deviceName: 'KaiOS Device',
			sourceId: 'my-app',
			enableConsoleLogHook: false,
			enableConsoleWarnHook: false,
			enableConsoleErrorHook: false,
			enableGlobalErrorListener: false,
			...config
		};

		this.cloneConsole();
		this.configureLogging();
	}

	cloneConsole() {
		const props = [
			'log',
			'info',
			'warn',
			'error',
			'exception',
			'debug',
			'table',
			'trace',
			'dir',
			'dirxml',
			'group',
			'groupCollapsed',
			'groupEnd',
			'time',
			'timeEnd',
			'timeStamp',
			'clear',
			'profile',
			'profileEnd',
			'assert',
			'count',
			'markTimeline',
			'timeline',
			'timelineEnd'
		];

		this.cleanConsole = {} as Console;

		for (const prop of props) {
			if (typeof (console as unknown as { [prop: string]: unknown })[prop] === 'function') {
				(this.cleanConsole as unknown as { [prop: string]: () => unknown })[prop] = (
					console as unknown as { [prop: string]: () => unknown }
				)[prop].bind(console);
			}
		}
	}

	async connect() {
		if (this.connection) {
			this.cleanConsole.log('Connection already established');
			return;
		}

		this.connection = new Connection(this.config, this.cleanConsole);
		await this.connection.connect();
	}

	disconnect() {
		if (!this.connection) {
			this.cleanConsole.log('No connection to disconnect');
			return;
		}

		this.connection.close();
		this.connection = null;
	}

	private configureLogging() {
		if (this.config.enableConsoleLogHook) {
			console.log = (...params: unknown[]) => {
				this.cleanConsole.log(...params);
				this.sendLog(LogLevel.Info, params);
			};
		}

		if (this.config.enableConsoleWarnHook) {
			console.warn = (...params: unknown[]) => {
				this.cleanConsole.warn(...params);
				this.sendLog(LogLevel.Warn, params);
			};
		}

		if (this.config.enableConsoleErrorHook) {
			console.error = (...params: unknown[]) => {
				this.cleanConsole.error(...params);
				this.sendLog(LogLevel.Error, params);
			};
		}

		if (this.config.enableGlobalErrorListener) {
			window.addEventListener('error', (event) => {
				this.cleanConsole.error(event);
				this.sendLog(LogLevel.Error, [event]);
			});
		}
	}

	private sendLog(level: LogLevel, args: unknown[]) {
		if (!this.connection) {
			this.cleanConsole.error('No active connection');
			return;
		}

		const stringifiedData: string[] = args.map((a) => {
			if (typeof a === 'string') {
				return a;
			} else if (a instanceof Error || a instanceof ErrorEvent) {
				return JSON.stringify(parseError(a));
			} else {
				return JSON.stringify(a);
			}
		});

		this.connection.sendMessage({
			requestId: '',
			type: MessageType.NewLog,
			data: {
				source: this.config!.sourceId,
				level: level,
				data: stringifiedData,
				timestamp: new Date().toISOString()
			}
		});
	}

	log = {
		debug: (...params: unknown[]) => {
			this.cleanConsole.log(...params);
			this.sendLog(LogLevel.Debug, params);
		},
		info: (...params: unknown[]) => {
			this.cleanConsole.log(...params);
			this.sendLog(LogLevel.Info, params);
		},
		warn: (...params: unknown[]) => {
			this.cleanConsole.warn(...params);
			this.sendLog(LogLevel.Warn, params);
		},
		error: (...params: unknown[]) => {
			this.cleanConsole.error(...params);
			this.sendLog(LogLevel.Error, params);
		}
	};
}
