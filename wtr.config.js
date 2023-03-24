import devServerConfig from './wds.config.js';
import merge from 'deepmerge';

const getPattern = (type) => {
	return `test/**/*.${type}.js`;
};

export default merge(
	devServerConfig,
	{
		files: getPattern('test'),
		testFramework: {
			config: {
				ui: 'bdd',
				timeout: 10000
			}
		}
	}
);
