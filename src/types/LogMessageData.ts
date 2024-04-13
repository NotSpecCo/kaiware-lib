import { LogLevel } from '../enums';

export type LogMessageData = {
	source: string;
	level: LogLevel;
	data: string[];
	timestamp: string;
};
