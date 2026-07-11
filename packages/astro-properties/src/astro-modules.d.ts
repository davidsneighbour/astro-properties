/**
 * `tsc` alone (unlike `astro check`) has no built-in understanding of `.astro`
 * single-file components. Real prop-type checking for these components happens
 * via the Astro compiler at build/test time (see the Container API tests in
 * `test/components.test.ts`, and `astro check` in the demo app which consumes
 * them from real pages). This shim only keeps standalone `tsc --noEmit` runs
 * from failing on the import itself.
 */
declare module "*.astro" {
  // biome-ignore lint/suspicious/noExplicitAny: component props are validated by the Astro compiler, not tsc, for .astro files
  const Component: any;
  export default Component;
}
