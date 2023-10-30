// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

// const electronHandler = {
//   ipcRenderer: {
//     sendMessage(channel: Channels, ...args: unknown[]) {
//       ipcRenderer.send(channel, ...args);
//     },
//     on(channel: Channels, func: (...args: unknown[]) => void) {
//       const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
//         func(...args);
//       ipcRenderer.on(channel, subscription);
//
//       return () => {
//         ipcRenderer.removeListener(channel, subscription);
//       };
//     },
//     once(channel: Channels, func: (...args: unknown[]) => void) {
//       ipcRenderer.once(channel, (_event, ...args) => func(...args));
//     },
//   },
// };

// contextBridge.exposeInMainWorld('electron', electronHandler);

const _setImmediate = setImmediate;
const _clearImmediate = clearImmediate;
process.once('loaded', () => {
  global.setImmediate = _setImmediate;
  global.clearImmediate = _clearImmediate;
});

// export type ElectronHandler = typeof electronHandler;
