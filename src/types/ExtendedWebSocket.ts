export type ExtendedWebSocket = WebSocket & {
	device: {
		id: string;
		name: string;
	};
};
