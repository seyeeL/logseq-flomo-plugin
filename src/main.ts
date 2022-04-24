import "@logseq/libs";

import { createApp } from 'vue'
import App from './App.vue';
import Antd from 'ant-design-vue';
import "virtual:windi-base.css";
import "virtual:windi-components.css";

import "virtual:windi-utilities.css";
import "virtual:windi-devtools";
import 'ant-design-vue/dist/antd.css';

const isDevelopment = import.meta.env.DEV

import { logseq as PL } from "../package.json";

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);
const magicKey = `__${PL.id}__loaded__`;
/**
 * user model
 */
function createModel() {
  return {
    openFlomo() {
      logseq.showMainUI()
    },
  }
}
function main() {
  const pluginId = logseq.baseInfo.id;
  console.info(`#${pluginId}: MAIN`);

  logseq.setMainUIInlineStyle({
    zIndex: 11,
  });

  const openIconName = "template-plugin-open";

  // @ts-expect-error
  top[magicKey] = true;

  logseq.provideStyle(css`
    div[data-injected-ui=${openIconName}-${pluginId}] {
      display: inline-flex;
      align-items: center;
      opacity: 0.55;
      font-weight: 500;
      padding: 0 5px;
      position: relative;
    }

    div[data-injected-ui=${openIconName}-${pluginId}]:hover {
      opacity: 0.9;
    }
  `);

  // logseq.provideUI({
  //   key: openIconName,
  //   path: "#search",
  //   template: `
  //     <a data-on-click="show"
  //        style="opacity: .6; display: inline-flex;">⚙️</a>
  //   `,
  // });

  logseq.App.registerUIItem('toolbar', {
    key: 'flomo',
    template: `<a data-on-click="show" title="flomo" class="button">flomo</a>`,
  });
  // main UI
  createApp(App).use(Antd, {}).mount('#app')
}

logseq.ready(createModel()).then(main)

// if (isDevelopment) {
//   app.mount('#root')
// }
