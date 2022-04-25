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
    @import url("https://at.alicdn.com/t/font_3354931_e10iisbf1yu.css");

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
    key: 'open-flomo',
    template: `
      <a class="button" data-on-click="openFlomo">
        <i class="iconfont icon-flomo"></i>
      </a>
    `,
  })
  // main UI
  createApp(App).use(Antd, {}).mount('#app')
}

logseq.ready(createModel()).then(main)

// if (isDevelopment) {
//   app.mount('#root')
// }
