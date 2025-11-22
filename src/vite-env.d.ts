/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// You can also add other global type declarations here if needed
// For example, if you were referencing process.env extensively:
// interface ImportMetaEnv {
//   readonly VITE_APP_TITLE: string
//   // more env variables...
// }

// interface ImportMeta {
//   readonly env: ImportMetaEnv
// }

interface Window {
	web3?: any;
	ethereum?: any;
}
