import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'umd',
      file: 'dist/index.umd.js',
      name: 'SimpleTrack',
    },
    {
      format: 'es',
      file: 'dist/index.es.js',
    }
  ],
  plugins: [typescript()],
};
