# yin1999.github.io

项目集合

- [Github镜像加速](https://mirrors.yin199909.workers.dev)

  配置方法
  1. 创建cloudflare账户并登录到[workers](https://workers.cloudflare.com/)
  2. 选择`创建Worker`
  3. 将[index.js](https://github.com/yin1999/yin1999.github.io/blob/main/gh-proxy/index.js)中的内容复制到左侧代码框，点击`保存并部署`。如果正常，右侧会显示首页

- [Epic免费游戏提醒](https://yin1999.github.io/epicfreegame/)

  服务基于[Firebase-FCM](https://firebase.google.com/docs/cloud-messaging)构建，服务端源码仓库：[获取免费游戏列表](https://github.com/yin1999/get-free-game-list)、[订阅消息推送](https://github.com/yin1999/free-game-subscribe)。服务端实现原理较为简单：每天定时获取epic免费游戏列表，筛选其中的`24H`内生效的免费游戏，并将免费游戏的消息发送给Firebase，由Firebase完成向浏览器端的消息推送服务。
  
  Note: 通知消息可以打开链接，但链接仅限`service worker`注册的Host，无法打开第三方的URL。

- [404页面](https://yin1999.github.io/404/)

  source: [404.html](https://yin1999.github.io/404.html)  
  from [freefrontend.com](https://freefrontend.com/html-funny-404-pages/)
