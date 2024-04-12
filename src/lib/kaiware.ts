import { LogLevel, MessageType } from '../enums';
import { Config, Log } from '../types';
import { Connection } from './connection';

export class Kaiware {
	private static config: Config | null = null;
	private static connection: Connection | null = null;

	static async connect(config: Config) {
		console.log('config:', config);
		this.config = config;

		// TODO: Add hooks for console.log, console.warn, console.error, and global error listener
		// this.configureLogging();

		if (this.connection) {
			console.log('Connection already established');
			return;
		}

		this.connection = new Connection(this.config);
		await this.connection.connect();
	}

	static disconnect() {
		if (!this.connection) {
			console.log('No connection to disconnect');
			return;
		}

		this.connection.close();
		this.connection = null;
		this.config = null;
	}

	private static sendLog(level: LogLevel, ...data: unknown[]) {
		this.verifyConfig();

		if (!this.connection) {
			console.log('No active connection');
			return;
		}

		const stringifiedData: string[] = data.map((a) => {
			if (typeof a === 'string') {
				return a;
			} else if (a instanceof Error) {
				return JSON.stringify(a, [
					'message',
					'type',
					'name',
					'stack',
					'fileName',
					'lineNumber',
					'columnNumber'
				]);
			} else if (a instanceof ErrorEvent) {
				return JSON.stringify(a, [
					'message',
					'type',
					'name',
					'stack',
					'fileName',
					'lineNumber',
					'columnNumber'
				]);
			} else {
				return JSON.stringify(a);
			}
		});

		const log: Omit<Log, 'id'> = {
			source: this.config!.sourceId,
			level: level,
			data: stringifiedData,
			timestamp: new Date().toISOString()
		};

		this.connection.sendMessage(MessageType.NewLog, log);
	}

	static log = {
		debug: (...params: unknown[]) => {
			this.sendLog(LogLevel.Debug, ...params);
		},
		info: (...params: unknown[]) => {
			this.sendLog(LogLevel.Info, ...params);
		},
		warn: (...params: unknown[]) => {
			this.sendLog(LogLevel.Warn, ...params);
		},
		error: (...params: unknown[]) => {
			this.sendLog(LogLevel.Error, ...params);
		}
	};

	// private static configureLogging() {
	// 	this.verifyConfig();

	// 	if (this.config!.enableConsoleLogHook) {
	// 		console.log = (...params: unknown[]) => {
	// 			this.sendLog(LogLevel.Info, params);
	// 		};
	// 	}

	// 	if (this.config!.enableConsoleWarnHook) {
	// 		console.warn = (...params: unknown[]) => {
	// 			this.sendLog(LogLevel.Warn, params);
	// 		};
	// 	}

	// 	if (this.config!.enableConsoleErrorHook) {
	// 		console.error = (...params: unknown[]) => {
	// 			this.sendLog(LogLevel.Error, params);
	// 		};
	// 	}

	// 	if (this.config!.enableGlobalErrorListener) {
	// 		window.addEventListener('error', (event) => {
	// 			this.sendLog(LogLevel.Error, event);
	// 		});
	// 	}
	// }

	private static verifyConfig() {
		if (!this.config) {
			throw new Error('Config not set. Call Kaiware.connect(config) first');
		}
	}
}
