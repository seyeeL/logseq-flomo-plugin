import '@logseq/libs';
import { createApp } from 'vue';
import App from './App.vue';
import { initializeSettings } from './utils/baseInfo'

import './index.css';
const isDevelopment = import.meta.env.DEV
const app = createApp(App)

function renderApp() {
  app.mount('#app');
}

if (isDevelopment) {
  renderApp();
} else {
  logseq.ready(() => {
    initializeSettings()

    logseq.on('ui:visible:changed', (e) => {
      console.log('ui:visible:changed', e)
      if (!e.visible) {
        app.unmount();
      }
    })

    logseq.provideModel({
      show() {
        renderApp();
        logseq.showMainUI()
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
