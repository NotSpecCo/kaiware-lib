export enum MessageType {
	GetDeviceInfo = 'get-device-info',
	GetDeviceInfoRes = 'get-device-info-res',

	GetElements = 'get-elements',
	GetElementsRes = 'get-elements-res',

	GetElementStyles = 'get-element-styles',
	GetElementStylesRes = 'get-element-styles-res',
	SetElementStyles = 'set-element-styles',
	SetElementStylesRes = 'set-element-styles-res',

	GetElementData = 'get-element-data',
	GetElementDataRes = 'get-element-data-res',
	SetElementData = 'set-element-data',
	SetElementDataRes = 'set-element-data-res',

	GetStorage = 'get-storage',
	GetStorageRes = 'get-storage-res',
	SetStorage = 'set-storage',
	SetStorageRes = 'set-storage-res',

	// Misc

	NewLog = 'new-log',
	ClearLogs = 'clear-logs',
	Error = 'error'
}
