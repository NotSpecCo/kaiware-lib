import { MessageType } from '../enums';

export type Message<TData = undefined> = {
	type: MessageType;
	data: TData;
};
