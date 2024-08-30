import { fetch, Headers, Request, Response } from "@whatwg-node/fetch";

// The WASM-loading code part of @worker-tools/htmlrewriter (a dependency of
// youversion-suggest) makes use of the Fetch API's Response object, which the
// package expects to be globally available (unaware that Raycast does not
// currently support native fetch); therefore, we expose the primitives globally
// using the @whatwg-node/fetch library (we cannot use node-fetch or
// cross-fetch, since those use Node streams instead of spec-compliant WHATWG
// streams)
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}
