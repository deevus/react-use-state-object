await Bun.build({
    entrypoints: ['./index.ts'],
    external: ['react'],
    outdir: 'dist/',
    minify: Bun.env.NODE_ENV === 'production'
});
