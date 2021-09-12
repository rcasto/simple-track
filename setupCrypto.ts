/**
 * JSDOM does not yet support crypto, require polyfilling in jest environment
 * which used JSDOM to simulate a more browser like environment.
 * 
 * https://github.com/jsdom/jsdom/issues/1612
 */
import crypto from "crypto";

Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: crypto.randomFillSync,
  },
});