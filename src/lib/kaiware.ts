import { MessageType } from '$/enums/messageType';
import { Connection } from '$/lib/connection';
import { Config } from '$/types/Config';
import { Log } from '$/types/Log';
import { LogLevel } from '$/types/logLevel';

export class Kaiware {
	private static config: Config | null = null;
	private static connection: Connection | null = null;

	static connect(config: Config) {
		console.log('config:', config);
		this.config = config;

		this.configureLogging();

		if (this.connection) {
			console.log('Connection already established');
			return;
		}

		this.connection = new Connection(this.config);
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

	static sendLog(level: LogLevel, ...data: unknown[]) {
		this.verifyConfig();

		if (!this.connection) {
			console.log('No active connection');
			return;
		}

		const log: Log = {
			sourceId: this.config!.sourceId,
			level: level,
			data, // Handle array
			timestamp: new Date().toISOString()
		};

		this.connection.sendMessage(MessageType.NewLog, log);
	}

	static log = {
		debug: (...params: unknown[]) => {
			this.sendLog('debug', params);
		},
		info: (...params: unknown[]) => {
			this.sendLog('info', params);
		},
		warn: (...params: unknown[]) => {
			this.sendLog('warn', params);
		},
		error: (...params: unknown[]) => {
			this.sendLog('error', params);
		}
	};

	private static configureLogging() {
		this.verifyConfig();

		if (this.config!.enableConsoleLogHook) {
			console.log = (...params: unknown[]) => {
				if (params[0] === KAIWARE_SKIP_LOG) return;
				this.sendLog('info', params);
			};
		}

		if (this.config!.enableConsoleWarnHook) {
			console.warn = (...params: unknown[]) => {
				if (params[0] === KAIWARE_SKIP_LOG) return;
				this.sendLog('warn', params);
			};
		}

		if (this.config!.enableConsoleErrorHook) {
			console.error = (...params: unknown[]) => {
				if (params[0] === KAIWARE_SKIP_LOG) return;
				this.sendLog('error', params);
			};
		}

		if (this.config!.enableGlobalErrorListener) {
			window.addEventListener('error', (event) => {
				this.sendLog('error', event);
			});
		}
	}

	private static verifyConfig() {
		if (!this.config) {
			throw new Error('Config not set. Call Kaiware.connect(config) first');
		}
	}
}

export const KAIWARE_SKIP_LOG = '__kaiware_skip_log__';
