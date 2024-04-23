import { z } from 'zod';
import { LogLevel, MessageType } from '../enums';
import { isJson } from '../utils';

// GetDeviceInfo
export const getDeviceInfoPayloadSchema = z.null();
export type GetDeviceInfoPayload = z.infer<typeof getDeviceInfoPayloadSchema>;

// GetDeviceInfoRes
export const getDeviceInfoResPayloadSchema = z.object({
	id: z.string(),
	name: z.string(),
	connectionType: z.union([z.literal('wifi'), z.literal('usb')])
});
export type GetDeviceInfoResPayload = z.infer<typeof getDeviceInfoResPayloadSchema>;

// GetElements
export const getElementsPayloadSchema = z.null();
export type GetElementsPayload = z.infer<typeof getElementsPayloadSchema>;

// GetElementsRes
export const getElementsResPayloadSchema = z.string();
export type GetElementsResPayload = z.infer<typeof getElementsResPayloadSchema>;

// GetElementStyles
export const getElementStylesPayloadSchema = z.object({
	index: z.number()
});
export type GetElementStylesPayload = z.infer<typeof getElementStylesPayloadSchema>;

// SetElementStyles
export const setElementStylesPayloadSchema = z.object({
	index: z.number(),
	styles: z.record(z.string())
});
export type SetElementStylesPayload = z.infer<typeof setElementStylesPayloadSchema>;

// SetElementStylesRes
export const setElementStylesResPayloadSchema = z.null();
export type SetElementStylesResPayload = z.infer<typeof setElementStylesResPayloadSchema>;

// GetElementStylesRes
export const getElementStylesResPayloadSchema = z.object({
	index: z.number(),
	styles: z.record(z.string())
});
export type GetElementStylesResPayload = z.infer<typeof getElementStylesResPayloadSchema>;

// GetElementData
export const getElementDataPayloadSchema = z.object({
	index: z.number()
});
export type GetElementDataPayload = z.infer<typeof getElementDataPayloadSchema>;

// GetElementDataRes
export const getElementDataResPayloadSchema = z.object({
	index: z.number(),
	data: z.record(z.string())
});
export type GetElementDataResPayload = z.infer<typeof getElementDataResPayloadSchema>;

// SetElementData
export const setElementDataPayloadSchema = z.object({
	index: z.number(),
	data: z.record(z.string(), z.unknown())
});
export type SetElementDataPayload = z.infer<typeof setElementDataPayloadSchema>;

// SetElementDataRes
export const setElementDataResPayloadSchema = z.null();
export type SetElementDataResPayload = z.infer<typeof setElementDataResPayloadSchema>;

// GetStorage
export const getStoragePayloadSchema = z.object({
	storageType: z.union([z.literal('local'), z.literal('session')])
});
export type GetStoragePayload = z.infer<typeof getStoragePayloadSchema>;

// GetStorageRes
export const getStorageResPayloadSchema = z.object({
	storageType: z.union([z.literal('local'), z.literal('session')]),
	data: z.record(z.string())
});
export type GetStorageResPayload = z.infer<typeof getStorageResPayloadSchema>;

// SetStorage
export const setStoragePayloadSchema = z.object({
	storageType: z.union([z.literal('local'), z.literal('session')]),
	data: z.record(z.string())
});
export type SetStoragePayload = z.infer<typeof setStoragePayloadSchema>;

// SetStorageRes
export const setStorageResPayloadSchema = z.null();
export type SetStorageResPayload = z.infer<typeof setStorageResPayloadSchema>;

// GetLogRes
export const getLogResPayloadSchema = z.object({
	source: z.string(),
	level: z.nativeEnum(LogLevel),
	data: z.array(z.string()),
	timestamp: z.string()
});
export type GetLogResPayload = z.infer<typeof getLogResPayloadSchema>;

// ClearLogs
export const clearLogsPayloadSchema = z.null();
export type ClearLogsPayload = z.infer<typeof clearLogsPayloadSchema>;

// ClearLogsRes
export const clearLogsResPayloadSchema = z.null();
export type ClearLogsResPayload = z.infer<typeof clearLogsResPayloadSchema>;

// NetworkRequest
export const networkRequestSchema = z.object({
	id: z.number(),
	requestId: z.string(),
	url: z.string(),
	method: z.union([
		z.literal('get'),
		z.literal('post'),
		z.literal('put'),
		z.literal('delete'),
		z.literal('patch')
	]),
	lifecycleStatus: z.union([
		z.literal('pending'),
		z.literal('success'),
		z.literal('error'),
		z.literal('aborted'),
		z.literal('timeout')
	]),
	headers: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
	body: z.string().optional(),
	startTime: z.number(),
	endTime: z.number().optional(),
	duration: z.number().optional(),
	responseStatus: z.number().optional(),
	responseHeaders: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
	responseBody: z.string().optional(),
	responseSize: z.number().optional()
});
export type NetworkRequest = z.infer<typeof networkRequestSchema>;

// NetworkRequestUpdateResPayload
export const networkRequestUpdateResPayload = z.object({
	requestId: z.string(),
	url: z.string().optional(),
	method: z
		.union([
			z.literal('get'),
			z.literal('post'),
			z.literal('put'),
			z.literal('delete'),
			z.literal('patch')
		])
		.optional(),
	lifecycleStatus: z
		.union([
			z.literal('pending'),
			z.literal('success'),
			z.literal('error'),
			z.literal('aborted'),
			z.literal('timeout')
		])
		.optional(),
	headers: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
	body: z.string().optional(),
	startTime: z.number().optional(),
	endTime: z.number().optional(),
	duration: z.number().optional(),
	responseStatus: z.number().optional(),
	responseHeaders: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
	responseBody: z.string().optional(),
	responseSize: z.number().optional()
});
export type NetworkRequestUpdateResPayload = z.infer<typeof networkRequestUpdateResPayload>;

// ConsoleCommandPayload
export const consoleCommandPayloadSchema = z.object({
	command: z.string(),
	parseDepth: z.number().optional()
});
export type ConsoleCommandPayload = z.infer<typeof consoleCommandPayloadSchema>;

// ConsoleCommandResPayload
export const consoleCommandResPayloadSchema = z.object({
	result: z.unknown().optional(),
	error: z.string().optional()
});
export type ConsoleCommandResPayload = z.infer<typeof consoleCommandResPayloadSchema>;

export type ConsoleCommand = {
	steps: CommandStep[];
};

export type CommandStep = {
	type: 'property' | 'function' | 'array';
	value: string;
	params: unknown[];
};

// Message
export const messageSchema = z.discriminatedUnion('type', [
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetDeviceInfo),
		data: getDeviceInfoPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetDeviceInfoRes),
		data: getDeviceInfoResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetElements),
		data: getElementsPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetElementsRes),
		data: getElementsResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetElementStyles),
		data: getElementStylesPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetElementStylesRes),
		data: getElementStylesResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.SetElementStyles),
		data: setElementStylesPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.SetElementStylesRes),
		data: setElementStylesResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetElementData),
		data: getElementDataPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetElementDataRes),
		data: getElementDataResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.SetElementData),
		data: setElementDataPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.SetElementDataRes),
		data: setElementDataResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetStorage),
		data: getStoragePayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.GetStorageRes),
		data: getStorageResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.SetStorage),
		data: setStoragePayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.SetStorageRes),
		data: setStorageResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.NewLog),
		data: getLogResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.ClearLogs),
		data: clearLogsPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.ClearLogsRes),
		data: clearLogsResPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.NetworkRequestUpdate),
		data: networkRequestUpdateResPayload
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.ExecuteConsoleCommand),
		data: consoleCommandPayloadSchema
	}),
	z.object({
		requestId: z.string(),
		type: z.literal(MessageType.ExecuteConsoleCommandRes),
		data: consoleCommandResPayloadSchema
	})
]);
type OmitRequestId<T> = {
	[Property in keyof T as Exclude<Property, 'requestId'>]: T[Property];
};

export type MessageWithId = z.infer<typeof messageSchema>;
export type Message = OmitRequestId<MessageWithId>;

// RawMessage
export const rawMessageSchema = z
	.string()
	.refine((val) => isJson(val), 'Must be a valid JSON string')
	.transform((val) => JSON.parse(val))
	.pipe(messageSchema);
export type RawMessage = z.infer<typeof rawMessageSchema>;
