import { MessageType } from '$/enums/messageType';
import { Config } from '$/types/Config';
import { formatMessage } from '$/utils/formatMessage';
import { isJson } from '$/utils/isJson';
import { z } from 'zod';

export class Connection {
	private socket: WebSocket;
	private config: Config;

	constructor(config: Config) {
		this.config = config;
		this.socket = new WebSocket(`ws://${config.address}:${config.port}`);

		this.socket.onopen = () => {
			console.log('WebSocket connection established');
		};

		this.socket.onmessage = (message) => {
			console.log('Message received: ', message);

			const messageSchema = z
				.string()
				.refine((val) => isJson(val), 'Must be a valid JSON string')
				.transform((val) => JSON.parse(val))
				.pipe(
					z.object({
						type: z.nativeEnum(MessageType),
						data: z.record(z.unknown()).optional()
					})
				);

			const validateMessage = messageSchema.safeParse(message.toString());
			if (!validateMessage.success) {
				this.socket.send(
					JSON.stringify(formatValidationError(validateMessage.error.issues))
				);
				return;
			}

			const messageData = JSON.parse(message.data);

			switch (message.type) {
				case MessageType.RefreshDeviceInfo:
					this.handleRefreshDeviceInfo();
					break;
				case MessageType.RefreshElements:
					this.handleRefreshElements();
					break;
				case MessageType.RefreshStorage:
					this.handleFetchStorage(messageData.storageType);
					break;
				default:
					console.log('Unknown message type received');
					break;
			}
		};

		this.socket.onclose = () => {
			console.log('WebSocket connection closed');
		};

		this.socket.onerror = (error) => {
			console.log('WebSocket error: ', error);
		};
	}

	close() {
		this.socket.close();
	}

	sendMessage(type: MessageType, data: unknown) {
		const message = formatMessage(type, data);
		this.socket.send(JSON.stringify(message));
	}

	private handleRefreshDeviceInfo() {
		this.sendMessage(MessageType.RefreshDeviceInfo, {
			id: this.config.deviceId,
			name: this.config.deviceName
		});
	}

	private handleRefreshElements() {
		this.sendMessage(MessageType.RefreshElements, document.querySelector('html')?.outerHTML);
	}

	private handleFetchStorage(storageType: 'local' | 'session') {
		if (storageType === 'local') {
			this.sendMessage(MessageType.StorageUpdate, {
				type: 'local',
				data: JSON.stringify(localStorage)
			});
		} else if (storageType === 'session') {
			this.sendMessage(MessageType.StorageUpdate, {
				type: 'session',
				data: JSON.stringify(sessionStorage)
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
