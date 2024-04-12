import { MessageType } from '$/enums/MessageType';

export type Message<TData = undefined> = {
	type: MessageType;
	data: TData;
};
