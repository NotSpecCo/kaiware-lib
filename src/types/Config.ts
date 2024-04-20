export type Config = {
	deviceId: string;
	deviceName: string;
	address: string;
	port: number;
	sourceId: string;
	enableConsoleLogHook: boolean;
	enableConsoleWarnHook: boolean;
	enableConsoleErrorHook: boolean;
	enableGlobalErrorListener: boolean;
	enableNetworkRequestHook: boolean;
};
