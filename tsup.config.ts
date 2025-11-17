import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  platform: 'neutral',
  sourcemap: true,
  cjsInterop: true,
  shims: true,
  dts: true,
  treeshake: true,
  external: [
    /@project-serum\/.*/,
    /@coral-xyz\/.*/,
    /@solana\/.*/,
  ],
  ...options,
}))
