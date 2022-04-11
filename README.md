# testcase-webpack-esm-css-extract

A test case for extracting single CSS chunk when bundling ESM library with Webpack.

## Reproduce

```sh
yarn
yarn start
```

```log
$ webpack serve --mode development --no-hot
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:8080/
<i> [webpack-dev-server] On Your Network (IPv4): http://172.24.49.91:8080/
<i> [webpack-dev-server] On Your Network (IPv6): http://[fe80::1]:8080/
<i> [webpack-dev-server] Content not from webpack is served from 'public, dist' directory
<i> [webpack-dev-middleware] wait until bundle finished: /
asset vendors-node_modules_webpack-dev-server_client_index_js_protocol_ws_3A_hostname_0_0_0_0_port_-262e74.js 193 KiB [emitted] [javascript module] (id hint: vendors)
asset runtime.js 4.93 KiB [emitted] [javascript module] (name: runtime)
asset esm.js 4.36 KiB [emitted] [javascript module] (name: esm)
asset styles.css 493 bytes [emitted] (name: styles) (id hint: styles)
Entrypoint esm 203 KiB = runtime.js 4.93 KiB styles.css 493 bytes vendors-node_modules_webpack-dev-server_client_index_js_protocol_ws_3A_hostname_0_0_0_0_port_-262e74.js 193 KiB esm.js 4.36 KiB
runtime modules 3.73 KiB 15 modules
orphan modules 3.23 KiB [orphan] 4 modules
javascript modules 154 KiB
  modules by path ./node_modules/ 154 KiB 20 modules
  modules by path ./src/ 437 bytes
    modules by path ./src/*.js 337 bytes 3 modules
    modules by path ./src/*.css 100 bytes
      ./src/app-a.css 50 bytes [built] [code generated]
      ./src/app-b.css 50 bytes [built] [code generated]
css modules 67 bytes
  css ./node_modules/css-loader/dist/cjs.js!./src/app-a.css 33 bytes [built] [code generated]
  css ./node_modules/css-loader/dist/cjs.js!./src/app-b.css 34 bytes [built] [code generated]
webpack 5.72.0 compiled successfully in 514 ms
```

Visit http://localhost:8080/ in browser, the DevTools -> Console shows an error:

```log
Failed to load resource: the server responded with a status of 404 (Not Found)    :8080/styles.js:1
```

Double-check in DevTools -> Network, the resource is missing:

```log
Request URL: http://localhost:8080/styles.js
Request Method: GET
Status Code: 404 Not Found
Remote Address: [::1]:8080
Referrer Policy: strict-origin-when-cross-origin
```

But its reference appears at the bottom the `http://localhost:8080/esm.js`:

```js
// ...
import * as __webpack_chunk_0__ from "./styles.js";
__webpack_require__.C(__webpack_chunk_0__);
// ...
```

## Expected

The entry ESM bundle `http://localhost:8080/esm.js` should not import anything from the nonexisting `styles.js`.

According to a quick debug, in [webpack/lib/esm/ModuleChunkFormatPlugin.js](https://github.com/webpack/webpack/blob/d3a0f8de03f26a83b4d5db3cfe177617a3801df3/lib/esm/ModuleChunkFormatPlugin.js#L144-L161), the `import` code for `styles` chunk (containing both `javascript` and `css/mini-extract` modules) is rendered just like the other chunks. However the empty `styles.js` file is somehow dropped (not sure by Webpack or MiniCssExtractPlugin), but `ModuleChunkFormatPlugin` is not aware of its nonexistence.
