// Lets `tsc --noEmit` run in CI before `next build` has generated next-env.d.ts.
declare module "*.css";
