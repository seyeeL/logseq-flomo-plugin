# Logseq Flomo Plugin

简体中文 | [English](./README-en_US.md)

✨ 同步 flomo 笔记至 logseq。

> **🚦 重要提示**：
> 为防止同步出错可能会导致数据丢失的问题，建议提前备份 logseq 库。或使用一个全新的库来测试，确认无误后再在正式库中使用。

## 🔨 使用准备

因 flomo 服务器设置以及安全原因，目前只能通过 http-proxy 的方法来获取 flomo 中的数据。请下载此项目（[flomo-proxy-server](https://github.com/swiftwind0405/flomo-proxy-server/releases)），运行起来后方可继续使用本插件。
用于数据请求的授权信息字段， 请参照下面[常见问题](#-常见问题)中的问题1获取。

## 📦 同步说明

1. 同步所有带标签的memo。以一级标签为页面名，建立一个flomo的节点（命名可修改），该一级标签下的所有memo（含二级及以下）均同步在这个节点下。
2. 如果memo附有图片，会同步在第一个子节点，方便折叠，否则多于一张图占据页面空间过多。
3. 批注也是作为子节点同步，如果批注带有标签，只会同步在被批注的节点下，不会作为一级内容同步，避免重复同步。
4. 如果同步过的内容在flomo里修改了内容，再次使用插件同步后，logseq里的内容会更新。
5. flomo里删除的内容，在logseq里不会因为同步而删除。
![image](https://github.com/SeyeeL/logseq-flomo-plugin/blob/main/src/assets/example.png)
![image](https://github.com/SeyeeL/logseq-flomo-plugin/blob/main/src/assets/example2.png)

## 💡 常见问题

### 1. 如何获取授权信息

1. 在你的浏览器登陆 flomo 账号后，按 F12 打开浏览器控制台后再次刷新 flomo 的页面
2. 找到列表中为 tz=8:0 的接口，复制里面的 userId、cookie、x-xsrf-token 到 logseq 插件的弹窗

![image](https://github.com/SeyeeL/logseq-flomo-plugin/blob/main/src/assets/getCookie.jpg)
