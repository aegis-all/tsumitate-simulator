/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARTIFACT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
