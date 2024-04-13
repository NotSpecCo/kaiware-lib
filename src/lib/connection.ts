import { z } from 'zod';
import { MessageType } from '../enums';
import { Config, Message } from '../types';
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
					case MessageType.RefreshDeviceInfo:
						this.handleRefreshDeviceInfo();
						break;
					case MessageType.RefreshElements:
						this.handleRefreshElements();
						break;
					case MessageType.RefreshStorage:
						this.handleRefreshStorage(message);
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

	sendMessage<TData = undefined>(type: MessageType, data: TData) {
		const message = { type, data };
		console.log('Sending message: ', message);

		if (!this.socket) {
			console.log('No active connection');
			return;
		}

		this.socket.send(JSON.stringify(message));
	}

	private handleRefreshDeviceInfo() {
		this.sendMessage(MessageType.DeviceInfoUpdate, {
			id: this.config.deviceId,
			name: this.config.deviceName
		});
	}

	private handleRefreshElements() {
		this.sendMessage(
			MessageType.ElementsUpdate,
			document.querySelector('html')?.outerHTML ?? ''
		);
	}

	private handleRefreshStorage(message: Message<{ storageType: 'local' | 'session' }>) {
		if (message.data.storageType === 'local') {
			this.sendMessage(MessageType.StorageUpdate, {
				type: 'local',
				data: localStorage
			});
		} else if (message.data.storageType === 'session') {
			this.sendMessage(MessageType.StorageUpdate, {
				type: 'session',
				data: sessionStorage
			});
		}
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
