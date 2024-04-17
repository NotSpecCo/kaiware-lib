/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { LogLevel, MessageType } from '../enums';
import { getDeviceInfoResPayloadSchema, messageSchema, rawMessageSchema } from './schemas';

describe('schemas', () => {
	describe('messages', () => {
        const testCases: any[] = [
            [{requestId:'req',type:MessageType.GetDeviceInfo, data: null}, true, ''],
			[{requestId:'req',type:MessageType.GetDeviceInfoRes, data: { id: 'id', name: 'name', connectionType: 'wifi' }}, true, ''],
			[{requestId:'req',type:MessageType.GetElements, data: null}, true, ''],
			[{requestId:'req',type:MessageType.GetElementsRes, data: 'html'}, true, ''],
			[{requestId:'req',type:MessageType.GetElementStyles, data:{ index: 1 }}, true, ''],
			[{requestId:'req',type:MessageType.GetElementStylesRes, data:{ index: 1, styles: {color:'red'} }}, true, ''],
			[{requestId:'req',type:MessageType.GetElementData, data:{ index: 1 }}, true, ''],
			[{requestId:'req',type:MessageType.GetElementDataRes, data:{ index: 1, data: {height:'100px'} }}, true, ''],
			[{requestId:'req',type:MessageType.GetStorage, data: {storageType: 'local'}}, true, ''],
			[{requestId:'req',type:MessageType.GetStorageRes, data: {storageType: 'local', data: {}}}, true, ''],
			[{requestId:'req',type:MessageType.SetStorage, data: {storageType: 'local', data: {}}}, true, ''],
			[{requestId:'req',type:MessageType.SetStorageRes, data: null}, true, ''],
			[{requestId:'req',type:MessageType.NewLog, data: {source: 'src', level: LogLevel.Info, data: ['1','2'], timestamp: '2024'}}, true, ''],
			[{requestId:'req',type:MessageType.ClearLogs, data: null}, true, ''],
			[{requestId:'req',type:MessageType.ClearLogsRes, data: null}, true, ''],
            [{requestId: null, type:MessageType.GetDeviceInfo, data: null}, false, 'requestId'],
			[{requestId:'req', type: null, data: null}, false, 'type'],
			[{requestId:'req', type:MessageType.GetDeviceInfoRes, data: { id: 'id', name: null, connectionType: 'wifi' }}, false, 'data'],
			[{requestId:'req', type:MessageType.GetElements, data: 123}, false, 'data'],
			[{requestId:'req', type:MessageType.GetElementsRes, data: null}, false, 'data'],
			[{requestId:'req', type:MessageType.GetElementStyles, data:{ index: [] }}, false, 'data'],
			[{requestId:'req', type:MessageType.GetElementStylesRes, data:{ index: 1, styles: null }}, false, 'data'],
			[{requestId:'req', type:MessageType.GetElementData, data: null}, false, 'data'],
			[{requestId:'req', type:MessageType.GetElementDataRes, data:{ index: 'abc', data: {height:'100px'} }}, false, 'data'],
			[{requestId:'req', type:MessageType.GetStorage, data: {storageType: 'other'}}, false, 'data'],
			[{requestId:'req', type:MessageType.GetStorageRes, data: {storageType: 'local', data: null}}, false, 'data'],
			[{requestId:'req', type:MessageType.SetStorage, data: {storageType: null, data: {}}}, false, 'data'],
			[{requestId:'req', type:MessageType.SetStorageRes, data: {prop:1}}, false, 'data'],
			[{requestId:'req', type:MessageType.NewLog, data: {source: 'src', level: 'other', data: ['1','2'], timestamp: '2024'}}, false, 'data'],
			[{requestId:'req', type:MessageType.ClearLogs, data: 123}, false, 'data'],
			[{requestId:'req', type:MessageType.ClearLogsRes, data: 'abc'}, false, 'data']
        ];

		it.each(testCases)(`should parse %s and return %s`, (data, success, errMsg) => {
			const result = messageSchema.safeParse(data);

			expect(result.success).toBe(success);
            if(success) {
                expect((result as any).data).toEqual(data);
            } else {
                expect((result as any).error.issues[0].path[0]).toEqual(errMsg);
            }
		});

		it.each(testCases.map(a => ([
            JSON.stringify(a[0]),
            a[1],
            a[2]
        ])))(`should parse %s and return %s`, (data, success, errMsg) => {
			const result = rawMessageSchema.safeParse(data);

			expect(result.success).toBe(success);
            if(success) {
                expect(JSON.stringify((result as any).data)).toEqual(data);
            } else {
                expect((result as any).error.issues[0].path[0]).toEqual(errMsg);
            }
		});
	});

    describe('getDeviceInfoResPayloadSchema', () => {
		it.each([
			[{ id: 'id', name: 'name', connectionType: 'wifi' }, true],
			[{ id: 'id', name: 'name', connectionType: 'usb' }, true]
		])(`should successfully parse %s`, (data, success) => {
			const result = getDeviceInfoResPayloadSchema.safeParse(data);

			expect(result.success).toBe(success);
			expect((result as any).data).toEqual(data);
		});

		it.each([
			[{ id: 'id', name: 'name', connectionType: 'other' }, false, 'connectionType'],
			[{ id: undefined, name: 'name', connectionType: 'usb' }, false, 'id']
		])(`should fail to parse %s`, (data, success, errMsg) => {
			const result = getDeviceInfoResPayloadSchema.safeParse(data);

			expect(result.success).toBe(success);
			expect((result as any).error.issues[0].path[0]).toEqual(errMsg);
		});
	});
});
