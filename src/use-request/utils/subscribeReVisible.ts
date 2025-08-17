import isDocumentVisible from "./isDocumentVisible.ts";

import { isBrowser } from "./index.ts";

type Listener = () => void;

const listeners: Listener[] = [];

function subscribe(listener: Listener) {
  listeners.push(listener);
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
}

if (isBrowser) {
  const revalidate = () => {
    if (!isDocumentVisible()) return;
    for (let i = 0; i < listeners.length; i += 1) {
      const listener = listeners[i];
      //@ts-ignore
      listener();
    }
  };
  window.addEventListener("visibilitychange", revalidate, false);
}

export default subscribe;
