import '@logseq/libs';
import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
const isDevelopment = import.meta.env.DEV
const app = createApp(App)

/**
 * user model
 */
function createModel() {
  return {
    openFlomo() {
      logseq.showMainUI();
    },
  };
}

/**
 * app entry
 */
function main() {
  logseq.setMainUIInlineStyle({
    position: 'fixed',
    zIndex: 11,
  });

  // external btns
  logseq.App.registerUIItem('toolbar', {
    key: 'open-flomo',
    template: `
      <a class="button" data-on-click="openFlomo">
        <i class="ti ti-clear-all"></i>
      </a>
    `,
  });

  // main UI
  createApp(App).mount('#app');
}

if (isDevelopment) {
  app.mount('#app')
} else {
  // bootstrap
  logseq.ready(createModel()).then(main);
}
