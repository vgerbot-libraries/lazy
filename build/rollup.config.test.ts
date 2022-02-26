import rollupConfig from './rollup.config';

delete rollupConfig.input;
rollupConfig.output = {
    sourcemap: false
};

export default rollupConfig;
