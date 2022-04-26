import Vue from "@vitejs/plugin-vue";
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default {
  plugins: [
    Vue(),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
  ],
  base: '',
  optimizeDeps: {
    exclude: ['dayjs'],
  },
  
}
