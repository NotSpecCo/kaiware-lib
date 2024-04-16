import { LogLevel } from '../enums';

export type Log = {
	id: number;
	source: string;
	level: LogLevel;
	data: string[];
	timestamp: string;
};
