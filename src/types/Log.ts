import { LogLevel } from '$/enums/LogLevel';

export type Log = {
	id: number;
	source: string;
	level: LogLevel;
	data: string[];
	timestamp: string;
};
