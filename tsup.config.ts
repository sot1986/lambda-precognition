import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'], // Adjust the pattern to include your TypeScript or JavaScript files
  outDir: 'dist', // Output directory
  format: ['cjs', 'esm'], // Output formats
  clean: true, // Clean the output directory before building
  dts: true, // Generate declaration files
  minify: true, // Minify the output files
  // Additional options can be added as needed
})
