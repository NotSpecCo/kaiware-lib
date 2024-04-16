import { z } from 'zod';
import { MessageType } from '../enums';
import {
	Config,
	GetDeviceInfoPayload,
	GetDeviceInfoResPayload,
	GetElementDataPayload,
	GetElementDataResPayload,
	GetElementStylesPayload,
	GetElementStylesResPayload,
	GetElementsPayload,
	GetElementsResPayload,
	GetStoragePayload,
	GetStorageResPayload,
	Message
} from '../types';
import { isJson } from '../utils';

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

				const messageSchema = z
					.string()
					.refine((val) => isJson(val), 'Must be a valid JSON string')
					.transform((val) => JSON.parse(val))
					.pipe(
						z.object({
							type: z.nativeEnum(MessageType),
							data: z.any().optional()
						})
					);

				const validateMessage = messageSchema.safeParse(event.data);
				if (!validateMessage.success) {
					console.log(
						JSON.stringify(formatValidationError(validateMessage.error.issues))
					);
					return;
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const message = JSON.parse(event.data) as Message<any>;

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

	sendMessage<TData = undefined>(message: Message<TData>) {
		console.log('Sending message: ', message);

		if (!this.socket) {
			console.log('No active connection');
			return;
		}

		this.socket.send(JSON.stringify(message));
	}

	private handleGetDeviceInfo(message: Message<GetDeviceInfoPayload>) {
		this.sendMessage<GetDeviceInfoResPayload>({
			requestId: message.requestId,
			type: MessageType.GetDeviceInfoRes,
			data: {
				id: this.config.deviceId,
				name: this.config.deviceName,
				connectionType: 'wifi'
			}
		});
	}

	private handleGetElements(message: Message<GetElementsPayload>) {
		this.sendMessage<GetElementsResPayload>({
			requestId: message.requestId,
			type: MessageType.GetElementsRes,
			data: document.querySelector('html')?.outerHTML ?? ''
		});
	}

	private handleGetStorage(message: Message<GetStoragePayload>) {
		if (message.data.storageType === 'local') {
			this.sendMessage<GetStorageResPayload>({
				requestId: message.requestId,
				type: MessageType.GetStorageRes,
				data: {
					storageType: 'local',
					data: localStorage
				}
			});
		} else if (message.data.storageType === 'session') {
			this.sendMessage<GetStorageResPayload>({
				requestId: message.requestId,
				type: MessageType.GetStorageRes,
				data: {
					storageType: 'session',
					data: sessionStorage
				}
			});
		}
	}

	private handleGetElementStyles(message: Message<GetElementStylesPayload>) {
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
		this.sendMessage<GetElementStylesResPayload>({
			requestId: message.requestId,
			type: MessageType.GetElementStylesRes,
			data: {
				index: message.data.index,
				styles
			}
		});
	}

	private handleGetElementData(message: Message<GetElementDataPayload>) {
		console.log('Getting data for element at index: ', message.data.index);

		const element = document.querySelectorAll('*')[message.data.index];
		console.log('Element: ', element);

		// TODO: Get data for element

		this.sendMessage<GetElementDataResPayload>({
			requestId: message.requestId,
			type: MessageType.GetElementDataRes,
			data: {}
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
