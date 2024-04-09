export const logger = {
	log: (...params: unknown[]) => {
		console.log('log:', ...params);
	},
	warn: (...params: unknown[]) => {
		console.warn('warn:', ...params);
	},
	error: (...params: unknown[]) => {
		console.error('error:', ...params);
	}
};
