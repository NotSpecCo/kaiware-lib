import { LogLevel, MessageType } from '../enums';
import { ExtendedXMLHttpRequest } from '../internal/types/ExtendedXMLHttpRequest';
import { saveDataToNetworkRequest } from '../internal/utils/saveDataToNetworkRequest';
import { Config, NetworkRequest, NetworkRequestUpdateResPayload } from '../types';
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
			enableNetworkRequestHook: false,
			...config
		};

		this.cloneConsole();
		this.configureLogging();
		this.configureNetworkRequests();
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

	configureNetworkRequests() {
		if (!this.config.enableNetworkRequestHook) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;

		const cleanSend = XMLHttpRequest.prototype.send;
		const cleanOpen = XMLHttpRequest.prototype.open;
		const cleanSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

		XMLHttpRequest.prototype.open = function (
			method: string,
			url: string | URL,
			async?: boolean,
			username?: string | null,
			password?: string | null
		) {
			saveDataToNetworkRequest(this as ExtendedXMLHttpRequest, {
				url: url.toString(),
				method: method.toLowerCase() as NetworkRequest['method']
			});

			cleanOpen.apply(this, [method, url, async as boolean, username, password]);
		};

		XMLHttpRequest.prototype.setRequestHeader = function (header: string, value: string) {
			saveDataToNetworkRequest(this as ExtendedXMLHttpRequest, {
				headers: [{ key: header, value }]
			});

			cleanSetRequestHeader.apply(this, [header, value]);
		};

		XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
			self.sendNetworkRequestUpdate({
				...(this as ExtendedXMLHttpRequest).kaiware,
				body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
				startTime: Date.now(),
				lifecycleStatus: 'pending'
			});

			this.addEventListener('load', () => {
				const responseHeaders = this.getAllResponseHeaders()
					.split('\n')
					.reduce(
						(acc, header) => {
							const index = header.indexOf(':');
							const key = header.slice(0, index);
							const value = header.slice(index + 1);

							if (key && value) {
								acc.push({ key: key.trim(), value: value.trim() });
							}
							return acc;
						},
						[] as { key: string; value: string }[]
					);

				self.sendNetworkRequestUpdate({
					requestId: (this as ExtendedXMLHttpRequest).kaiware.requestId,
					endTime: Date.now(),
					lifecycleStatus: 'success',
					responseStatus: this.status,
					responseHeaders,
					responseBody: this.responseText,
					responseSize: new Blob([this.responseText]).size
				});
			});

			this.addEventListener('error', () => {
				const responseHeaders = this.getAllResponseHeaders()
					.split('\n')
					.reduce(
						(acc, header) => {
							const index = header.indexOf(':');
							const key = header.slice(0, index);
							const value = header.slice(index + 1);

							if (key && value) {
								acc.push({ key: key.trim(), value: value.trim() });
							}
							return acc;
						},
						[] as { key: string; value: string }[]
					);

				self.sendNetworkRequestUpdate({
					requestId: (this as ExtendedXMLHttpRequest).kaiware.requestId,
					endTime: Date.now(),
					lifecycleStatus: 'error',
					responseStatus: this.status,
					responseHeaders,
					responseBody: this.responseText
				});
			});

			this.addEventListener('abort', () => {
				self.sendNetworkRequestUpdate({
					requestId: (this as ExtendedXMLHttpRequest).kaiware.requestId,
					endTime: Date.now(),
					lifecycleStatus: 'aborted',
					responseStatus: this.status,
					responseBody: this.responseText
				});
			});

			this.addEventListener('timeout', () => {
				self.sendNetworkRequestUpdate({
					requestId: (this as ExtendedXMLHttpRequest).kaiware.requestId,
					endTime: Date.now(),
					lifecycleStatus: 'timeout',
					responseStatus: this.status,
					responseBody: this.responseText
				});
			});

			return cleanSend.apply(this, [body]);
		};
	}

	private sendNetworkRequestUpdate(request: NetworkRequestUpdateResPayload) {
		if (!this.connection) {
			this.cleanConsole.error('No active connection');
			return;
		}

		this.connection.sendMessage({
			requestId: '',
			type: MessageType.NetworkRequestUpdate,
			data: request
		});
	}
}
