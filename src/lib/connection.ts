import { z } from 'zod';
import { MessageType } from '../enums';
import { Config, MessageWithId, rawMessageSchema } from '../types';

export class Connection {
	private socket: WebSocket | null = null;
	private config: Config;

	constructor(config: Config) {
		this.config = config;
	}

	connect() {
		if (this.socket) {
			console.log('Connection already established');
			return;
		}

		return new Promise<void>((resolve) => {
			this.socket = new WebSocket(`ws://${this.config.address}:${this.config.port}`);

			this.socket.onopen = () => {
				console.log('WebSocket connection established');
				resolve();
			};

			this.socket.onmessage = (event) => {
				console.log('Message received: ', JSON.parse(event.data));

				const validateMessage = rawMessageSchema.safeParse(event.data);
				if (!validateMessage.success) {
					console.log(
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
					default:
						console.log('Unknown message type received');
						break;
				}
			};

			this.socket.onclose = () => {
				console.log('WebSocket connection closed');
				this.socket = null;
			};

			this.socket.onerror = (error) => {
				console.log('WebSocket error: ', error);
			};
		});
	}

	close() {
		if (!this.socket) {
			console.log('No active connection');
			return;
		}

		this.socket.close();
	}

	sendMessage(message: MessageWithId) {
		console.log('Sending message: ', message);

		if (!this.socket) {
			console.log('No active connection');
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
		console.log('Getting styles for element at index: ', message.data.index);

		const element = document.querySelectorAll('*')[message.data.index];
		console.log('Element: ', element);

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
		console.log('Getting data for element at index: ', message.data.index);

		const element = document.querySelectorAll('*')[message.data.index];
		console.log('Element: ', element);

		// TODO: Get data for element

		this.sendMessage({
			requestId: message.requestId,
			type: MessageType.GetElementDataRes,
			data: { index: message.data.index, data: {} }
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
