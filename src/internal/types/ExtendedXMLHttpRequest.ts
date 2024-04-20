import { NetworkRequest } from '../../types';

export type ExtendedXMLHttpRequest = XMLHttpRequest & {
	kaiware: {
		requestId: string;
		url: string;
		method: NetworkRequest['method'];
		headers?: NetworkRequest['headers'];
	};
};
