export enum MessageType {
	// Incoming
	RefreshElements = 'refresh-elements',
	RefreshDeviceInfo = 'refresh-device-info',
	RefreshStorage = 'refresh-storage',

	// Outgoing
	DeviceInfoUpdate = 'device-info-update',
	NewLog = 'new-log',
	ClearLogs = 'clear-logs',
	ElementsUpdate = 'elements-update',
	StorageUpdate = 'storage-update'
}
