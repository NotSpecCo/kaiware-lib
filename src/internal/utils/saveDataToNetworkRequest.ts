import { NetworkRequest } from '../../types';
import { ExtendedXMLHttpRequest } from '../types/ExtendedXMLHttpRequest';
import { generateUUID } from './generateUUID';

export function saveDataToNetworkRequest(
	xhr: ExtendedXMLHttpRequest,
	data: Partial<NetworkRequest>
) {
	if (!xhr.kaiware) {
		xhr.kaiware = {
			requestId: generateUUID(),
			url: '',
			method: 'get',
			headers: []
		};
	}

	xhr.kaiware = {
		...xhr.kaiware,
		...data,
		headers: xhr.kaiware.headers
			? [...xhr.kaiware.headers, ...(data.headers || [])]
			: data.headers
	};
}
