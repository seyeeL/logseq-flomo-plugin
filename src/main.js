import '@logseq/libs';
import { createApp } from 'vue';
import App from './App.vue';
import { initializeSettings } from './utils/baseInfo'

import './index.css';
const isDevelopment = import.meta.env.DEV
let app = createApp(App)

function renderApp() {
  app = createApp(App);
  app.mount('#app');
}

if (isDevelopment) {
  renderApp();
} else {
  logseq.ready(() => {
    initializeSettings()

    logseq.on('ui:visible:changed', (e) => {
      if (!e.visible) {
        app.unmount();
        app = null;
      }
    })

    logseq.provideModel({
      show() {
        logseq.showMainUI()
        renderApp();
      },
    })

    logseq.App.registerUIItem('toolbar', {
      key: 'logseq-flomo-plugin',
      template: `
        <a class="button" data-on-click="show">
          <i class="ti ti-clear-all"></i>
        </a>
      `,
    });

    logseq.App.registerCommandPalette({
      key: 'logseq-flomo-plugin:show',
      label: 'Show flomo',
    }, data => {
      renderApp()
      logseq.showMainUI()
    })
  })
}
