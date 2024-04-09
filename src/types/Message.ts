import { MessageType } from '$/enums/messageType';

export type Message = {
	type: MessageType;
	data?: unknown;
};
