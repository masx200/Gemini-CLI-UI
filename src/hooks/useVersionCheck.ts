// hooks/useVersionCheck.js
//@ts-ignore
import { version } from "../../package.json";

export const useVersionCheck = () => {
  return { currentVersion: version };
};
