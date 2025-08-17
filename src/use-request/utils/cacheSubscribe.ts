type Listener = (data: any) => void;
const listeners: Record<string, Listener[]> = {};

const trigger = (key: string, data: any) => {
  if (listeners[key]) {
    //@ts-ignore
    listeners[key].forEach((item) => item(data));
  }
};

const subscribe = (key: string, listener: Listener) => {
  if (!listeners[key]) {
    listeners[key] = [];
  }
  //@ts-ignore
  listeners[key].push(listener);

  return function unsubscribe() {
    //@ts-ignore
    const index = listeners[key].indexOf(listener);
    //@ts-ignore
    listeners[key].splice(index, 1);
  };
};

export { subscribe, trigger };
