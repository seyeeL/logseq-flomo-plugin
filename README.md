# Logseq Flomo Plugin

填写你 flomo 的 cookie 和 token，同步笔记至 logseq
Enter your Flomo cookie and token. Fetch Updates will fetch new memos

Selecting a rule and clicking fetching will gather memos and create a page.

## Running the Plugin

npm install && npm run build in terminal to install dependencies.
Load unpacked plugin in Logseq Desktop client.

## 使用准备(Preparation for use)

因 flomo 服务器设置以及安全原因，目前只能通过 http-proxy 的方法来获取 flomo 中的数据。userId cookie token 请参照下面的常见问题方式获取。

### flomo server proxy

1. open the server directory
   打开 serve 文件夹

```bash
cd server 
```

2. install dependencies
   安装依赖包

```bash
npm install
```

3. run the server, it will proxy http://localhost:3828 to https://flomoapp.com.
   运行本地服务器，用来代理请求

```bash
npm start
```

> It will be moved to another repo in later.

1. open http://localhost:3000
## 同步说明和提示

1. 第一次同步请建一个全新 logseq 库，测试结果无异常。
2. 同步所有带标签的memo。以一级标签为页面名，建立一个flomo的节点（命名可修改），该一级标签下的所有memo（含二级及以下）均同步在这个节点下。
3. 如果memo附有图片，会同步在第一个子节点，方便折叠，否则多于一张图占据页面空间过多。
4. 批注也是作为子节点同步，如果批注带有标签，只会同步在被批注的节点下，不会作为一级内容同步，避免重复同步。
5. 如果同步过的内容在flomo里修改了内容，再次使用插件同步后，logseq里的内容会更新。
6. flomo里删除的内容，在logseq里不会因为同步而删除。
![image](https://github.com/SeyeeL/logseq-flomo-plugin/blob/main/src/assets/example.png)
![image](https://github.com/SeyeeL/logseq-flomo-plugin/blob/main/src/assets/example2.png)

## 常用问题(Q & A)
###  How to get userId cookie token？
如何拿到 userId cookie token？
1. 在你的浏览器登陆 flomo 账号后，按 F12 打开浏览器控制台后再次刷新 flomo 的页面
2. 找到列表中为 tz=8:0 的接口，复制里面的 userId、cookie、x-xsrf-token 到 logseq 插件的弹窗

![image](https://github.com/SeyeeL/logseq-flomo-plugin/blob/main/src/assets/getCookie.jpg)
