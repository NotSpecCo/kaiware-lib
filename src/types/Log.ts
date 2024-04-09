import { LogLevel } from '$/types/logLevel';

export type Log = {
	sourceId: string;
	level: LogLevel;
	data: unknown;
	timestamp: string;
};
