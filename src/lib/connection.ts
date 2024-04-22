import { z } from 'zod';
import { MessageType } from '../enums';
import { Config, ConsoleCommandResPayload, MessageWithId, rawMessageSchema } from '../types';
import { makeSerializable, parseConsoleCommand, stringifyObject } from '../utils';

export class Connection {
	private config: Config;
	private socket: WebSocket | null = null;
	private cleanConsole: Console;

	constructor(config: Config, cleanConsole: Console) {
		this.config = config;
		this.cleanConsole = cleanConsole;
	}

	connect() {
		if (this.socket) {
			this.cleanConsole.log('Connection already established');
			return;
		}

		return new Promise<void>((resolve, reject) => {
			this.socket = new WebSocket(`ws://${this.config.address}:${this.config.port}`);
			let isConnectionEstablished = false;

			this.socket.onopen = () => {
				this.cleanConsole.log('WebSocket connection established');
				isConnectionEstablished = true;
				resolve();
			};

			this.socket.onmessage = (event) => {
				this.cleanConsole.log('Message received: ', JSON.parse(event.data));

				const validateMessage = rawMessageSchema.safeParse(event.data);
				if (!validateMessage.success) {
					this.cleanConsole.log(
						JSON.stringify(formatValidationError(validateMessage.error.issues))
					);
					return;
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const message = JSON.parse(event.data) as MessageWithId;

				switch (message.type) {
					case MessageType.GetDeviceInfo:
						this.handleGetDeviceInfo(message);
						break;
					case MessageType.GetElements:
						this.handleGetElements(message);
						break;
					case MessageType.GetElementStyles:
						this.handleGetElementStyles(message);
						break;
					case MessageType.SetElementStyles:
						this.handleSetElementStyles(message);
						break;
					case MessageType.GetElementData:
						this.handleGetElementData(message);
						break;
					case MessageType.GetStorage:
						this.handleGetStorage(message);
						break;
					case MessageType.ExecuteConsoleCommand:
						this.handleConsoleCommand(message);
						break;
					default:
						this.cleanConsole.log(`Unknown message type received: ${message.type}`);
						break;
				}
			};

			this.socket.onclose = () => {
				this.cleanConsole.log('WebSocket connection closed');
				this.socket = null;

				if (!isConnectionEstablished) {
					reject();
				}
			};

			this.socket.onerror = (error) => {
				this.cleanConsole.log('WebSocket error: ', error);

				if (!isConnectionEstablished) {
					reject();
				}
			};
		});
	}

	close() {
		if (!this.socket) {
			this.cleanConsole.log('No active connection');
			return;
		}

		this.socket.close();
	}

	sendMessage(message: MessageWithId) {
		this.cleanConsole.log('Sending message: ', message);

		if (!this.socket) {
			this.cleanConsole.log('No active connection');
			return;
		}

		this.socket.send(JSON.stringify(message));
	}

	private handleGetDeviceInfo(message: MessageWithId & { type: MessageType.GetDeviceInfo }) {
		this.sendMessage({
			requestId: message.requestId,
			type: MessageType.GetDeviceInfoRes,
			data: {
				id: this.config.deviceId,
				name: this.config.deviceName,
				connectionType: 'wifi'
			}
		});
	}

	private handleGetElements(message: MessageWithId & { type: MessageType.GetElements }) {
		this.sendMessage({
			requestId: message.requestId,
			type: MessageType.GetElementsRes,
			data: document.querySelector('html')?.outerHTML ?? ''
		});
	}

	private handleGetStorage(message: MessageWithId & { type: MessageType.GetStorage }) {
		if (message.data.storageType === 'local') {
			this.sendMessage({
				requestId: message.requestId,
				type: MessageType.GetStorageRes,
				data: {
					storageType: 'local',
					data: localStorage
				}
			});
		} else if (message.data.storageType === 'session') {
			this.sendMessage({
				requestId: message.requestId,
				type: MessageType.GetStorageRes,
				data: {
					storageType: 'session',
					data: sessionStorage
				}
			});
		}
	}

	private handleGetElementStyles(
		message: MessageWithId & { type: MessageType.GetElementStyles }
	) {
		const element = document.querySelectorAll('*')[message.data.index];

		const rawStyles = window.getComputedStyle(element);
		const styles: Record<string, string> = Object.entries(rawStyles).reduce(
			(acc, val) => {
				acc[val[1]] = rawStyles.getPropertyValue(val[1]);
				return acc;
			},
			{} as Record<string, string>
		);
		this.sendMessage({
			requestId: message.requestId,
			type: MessageType.GetElementStylesRes,
			data: {
				index: message.data.index,
				styles
			}
		});
	}

	private handleSetElementStyles(
		message: MessageWithId & { type: MessageType.SetElementStyles }
	) {
		const element = document.querySelectorAll('*')[message.data.index] as HTMLElement;

		Object.entries(message.data.styles).forEach(([key, value]) => {
			element.style.setProperty(key, value);
		});

		this.sendMessage({
			requestId: message.requestId,
			type: MessageType.SetElementStylesRes,
			data: null
		});
	}

	private handleGetElementData(message: MessageWithId & { type: MessageType.GetElementData }) {
		// const element = document.querySelectorAll('*')[message.data.index];

		// TODO: Get data for element

		this.sendMessage({
			requestId: message.requestId,
			type: MessageType.GetElementDataRes,
			data: { index: message.data.index, data: {} }
		});
	}

	private async handleConsoleCommand(
		message: MessageWithId & { type: MessageType.ExecuteConsoleCommand }
	) {
		const consoleCommand = parseConsoleCommand(message.data.command);

		let response: ConsoleCommandResPayload = {};
		let currentValue: unknown = window;
		try {
			for (const step of consoleCommand.steps) {
				switch (step.type) {
					case 'property':
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						currentValue = (currentValue as any)[step.value];
						break;
					case 'function':
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						currentValue = await (currentValue as any)[step.value](...step.params);
						break;
					case 'array':
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						currentValue = (currentValue as any)[Number(step.value)];
						break;
				}
			}

			let responseData;
			if (typeof currentValue === 'object' && !Array.isArray(currentValue)) {
				responseData = stringifyObject(currentValue ?? {});
				console.log('responseData', responseData);
			} else if (Array.isArray(currentValue)) {
				responseData = currentValue.map((val) => makeSerializable(val));
			}

			response = {
				result: responseData
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			response = { error: err?.message ?? 'Unknown error' };
		}

		this.sendMessage({
			requestId: message.requestId,
			type: MessageType.ExecuteConsoleCommandRes,
			data: response
		});
	}
}

function formatValidationError(issues: z.ZodIssue[]) {
	return issues.reduce(
		(acc: { error: string; data: { [key: string]: string } }, issue) => {
			acc.data[issue.path.join('.')] = issue.message;
			return acc;
		},
		{ error: 'ValidationError', data: {} }
	);
}
