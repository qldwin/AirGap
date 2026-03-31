import { isClient } from "@vueuse/core";
import { useId } from "reka-ui";
import { h, render } from "vue";

// Simple cache using a Map to store serialized object keys
const cache = new Map();

function serializeKey(key) {
  const sortedKeys = Object.keys(key).sort((a, b) => {
    return String(a).localeCompare(String(b));
  });

  return JSON.stringify(key, sortedKeys);
}

export function componentToString(config, component, props) {
  if (!isClient) return;

  // This function will be called once during mount lifecycle
  const id = useId();

  // https://unovis.dev/docs/auxiliary/Crosshair#component-props
  return (_data, x) => {
    const data = "data" in _data ? _data.data : _data;
    const serializedKey = `${id}-${serializeKey(data)}`;
    const cachedContent = cache.get(serializedKey);
    if (cachedContent) return cachedContent;

    const vnode = h(component, { ...props, payload: data, config, x });
    const div = document.createElement("div");
    render(vnode, div);
    cache.set(serializedKey, div.innerHTML);
    return div.innerHTML;
  };
}
