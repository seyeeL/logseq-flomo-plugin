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
  console.log('main');
  const key = logseq.baseInfo.id;

  logseq.provideStyle(`
    @import url("https://at.alicdn.com/t/font_3354931_e10iisbf1yu.css");
    
    div[data-injected-ui=open-calendar-${key}] {
      display: flex;
      align-items: center;
      font-weight: 500;
      position: relative;
      top: 0px;
    }
    
    div[data-injected-ui=open-calendar-${key}] a {
      opacity: 1;
      padding: 6px;
    }
    
    div[data-injected-ui=open-calendar-${key}] iconfont {
      font-size: 18px;
    }
  `);

  // external btns
  logseq.App.registerUIItem('toolbar', {
    key: 'open-flomo',
    template: `
      <a class="button" data-on-click="openFlomo">
        <i class="iconfont icon-flomo"></i>
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
