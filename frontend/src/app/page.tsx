15:53:44.376 Running build in Washington, D.C., USA (East) – iad1
15:53:44.376 Build machine configuration: 2 cores, 8 GB
15:53:44.499 Cloning github.com/borisMayer/SEMINARIO-REFORMADO (Branch: main, Commit: 3479ec6)
15:53:44.500 Previous build caches not available.
15:53:49.205 Cloning completed: 4.706s
15:53:50.779 Running "vercel build"
15:53:51.190 Vercel CLI 49.1.2
15:53:51.716 Installing dependencies...
15:54:10.884 
15:54:10.884 added 106 packages in 19s
15:54:10.884 
15:54:10.884 24 packages are looking for funding
15:54:10.884   run `npm fund` for details
15:54:10.932 Detected Next.js version: 14.2.11
15:54:10.935 Running "npm run build"
15:54:11.046 
15:54:11.047 > teologia-frontend@0.1.0 build
15:54:11.047 > next build
15:54:11.047 
15:54:11.628 Attention: Next.js now collects completely anonymous telemetry regarding usage.
15:54:11.629 This information is used to shape Next.js' roadmap and prioritize features.
15:54:11.630 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
15:54:11.630 https://nextjs.org/telemetry
15:54:11.630 
15:54:11.632 (node:92) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///vercel/path0/frontend/next.config.js is not specified and it doesn't parse as CommonJS.
15:54:11.632 Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
15:54:11.633 To eliminate this warning, add "type": "module" to /vercel/path0/frontend/package.json.
15:54:11.633 (Use `node --trace-warnings ...` to show where the warning was created)
15:54:11.682   ▲ Next.js 14.2.11
15:54:11.683 
15:54:11.697    Creating an optimized production build ...
15:54:12.157 (node:107) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///vercel/path0/frontend/next.config.js is not specified and it doesn't parse as CommonJS.
15:54:12.157 Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
15:54:12.157 To eliminate this warning, add "type": "module" to /vercel/path0/frontend/package.json.
15:54:12.157 (Use `node --trace-warnings ...` to show where the warning was created)
15:54:15.506 (node:131) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///vercel/path0/frontend/next.config.js is not specified and it doesn't parse as CommonJS.
15:54:15.507 Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
15:54:15.507 To eliminate this warning, add "type": "module" to /vercel/path0/frontend/package.json.
15:54:15.507 (Use `node --trace-warnings ...` to show where the warning was created)
15:54:16.423 (node:147) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///vercel/path0/frontend/next.config.js is not specified and it doesn't parse as CommonJS.
15:54:16.424 Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
15:54:16.424 To eliminate this warning, add "type": "module" to /vercel/path0/frontend/package.json.
15:54:16.424 (Use `node --trace-warnings ...` to show where the warning was created)
15:54:21.328  ✓ Compiled successfully
15:54:21.331    Linting and checking validity of types ...
15:54:21.699 
15:54:21.701    We detected TypeScript in your project and reconfigured your tsconfig.json file for you. Strict-mode is set to false by default.
15:54:21.702    The following suggested values were added to your tsconfig.json. These values can be changed to fit your project's needs:
15:54:21.702 
15:54:21.702    	- incremental was set to true
15:54:21.703    	- include was updated to add '.next/types/**/*.ts'
15:54:21.703    	- plugins was updated to add { name: 'next' }
15:54:21.703    	- exclude was set to ['node_modules']
15:54:21.704 
15:54:23.680 Failed to compile.
15:54:23.680 
15:54:23.681 ./src/app/page.tsx:75:18
15:54:23.681 Type error: Type '{ children: (string | Element)[]; className: string; }' is missing the following properties from type '{ [x: string]: any; className?: string; variant: any; size: any; children: any; }': variant, size
15:54:23.682 
15:54:23.682 [0m [90m 73 |[39m             [33m<[39m[33mDialog[39m open[33m=[39m{openUpload} onOpenChange[33m=[39m{setOpenUpload}[33m>[39m[0m
15:54:23.682 [0m [90m 74 |[39m               [33m<[39m[33mDialogTrigger[39m asChild[33m>[39m[0m
15:54:23.682 [0m[31m[1m>[22m[39m[90m 75 |[39m                 [33m<[39m[33mButton[39m className[33m=[39m[32m"bg-indigo-600 hover:bg-indigo-700"[39m[33m>[39m[0m
15:54:23.682 [0m [90m    |[39m                  [31m[1m^[22m[39m[0m
15:54:23.682 [0m [90m 76 |[39m                   [33m<[39m[33mFiUpload[39m className[33m=[39m[32m"mr-2"[39m [33m/[39m[33m>[39m [33mSubir[39m recurso[0m
15:54:23.682 [0m [90m 77 |[39m                 [33m<[39m[33m/[39m[33mButton[39m[33m>[39m[0m
15:54:23.682 [0m [90m 78 |[39m               [33m<[39m[33m/[39m[33mDialogTrigger[39m[33m>[39m[0m
15:54:23.725 Error: Command "npm run build" exited with 1
