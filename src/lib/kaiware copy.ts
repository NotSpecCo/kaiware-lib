import { MessageType } from '$/enums/messageType';
import { Connection } from '$/lib/connection';
import { Config } from '$/types/Config';
import { Log } from '$/types/Log';
import { LogLevel } from '$/types/logLevel';

export class Kaiware {
	private config: Config;
	private connection: Connection | null = null;

	constructor(config: Config) {
		console.log('config:', config);
		this.config = config;

		this.configureLogging();
	}

	connect() {
		if (this.connection) {
			console.log('Connection already established');
			return;
		}

		this.connection = new Connection(this.config);
	}

	disconnect() {
		if (!this.connection) {
			console.log('No connection to disconnect');
			return;
		}

		this.connection.close();
		this.connection = null;
	}

	sendLog(level: LogLevel, ...data: unknown[]) {
		if (!this.connection) {
			console.log('No active connection');
			return;
		}

		const log: Log = {
			sourceId: this.config.sourceId,
			level: level,
			data, // Handle array
			timestamp: new Date().toISOString()
		};

		this.connection.sendMessage(MessageType.NewLog, log);
	}

	private configureLogging() {
		if (this.config.enableConsoleLogHook) {
			console.log = (...params: unknown[]) => {
				if (params[0] === KAIWARE_SKIP_LOG) return;
				this.sendLog('info', params);
			};
		}

		if (this.config.enableConsoleWarnHook) {
			console.warn = (...params: unknown[]) => {
				if (params[0] === KAIWARE_SKIP_LOG) return;
				this.sendLog('warn', params);
			};
		}

		if (this.config.enableConsoleErrorHook) {
			console.error = (...params: unknown[]) => {
				if (params[0] === KAIWARE_SKIP_LOG) return;
				this.sendLog('error', params);
			};
		}

		if (this.config.enableGlobalErrorListener) {
			window.addEventListener('error', (event) => {
				this.sendLog('error', event);
			});
		}
	}
}

export const KAIWARE_SKIP_LOG = '__kaiware_skip_log__';
