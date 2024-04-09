import { MessageType } from '$/enums/messageType';
import { Message } from '$/types/Message';

export function formatMessage(type: MessageType, data: unknown): Message {
	const message: Message = { type };

	if (typeof data === 'string') {
		message.data = data;
	} else if (typeof data === 'number') {
		message.data = data.toString();
	} else if (data instanceof Error) {
		message.data = JSON.stringify(data, [
			'message',
			'type',
			'name',
			'stack',
			'fileName',
			'lineNumber',
			'columnNumber'
		]);
	} else if (data instanceof ErrorEvent) {
		message.data = JSON.stringify(data, [
			'message',
			'type',
			'name',
			'stack',
			'fileName',
			'lineNumber',
			'columnNumber'
		]);
	} else if (typeof data === 'object') {
		message.data = JSON.stringify(data);
	}

	return message;
}
