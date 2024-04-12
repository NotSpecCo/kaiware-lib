import { LogLevel } from '$/enums/LogLevel';

export type Log = {
	source: string;
	level: LogLevel;
	data: string[];
	timestamp: string;
};
