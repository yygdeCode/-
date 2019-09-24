const PORT = 1230; // 监听端口
const WebSocket = require("ws"); // 引入 ws 库
const express = require('express')
const app = express()
app.use(express.static('page'))
app.listen(8081, () => {
  console.log(`server listen at 8080`)
});
const wss = new WebSocket.Server({ port: PORT }); // 声明wss对象
wss.broadcastToElse = function broadcast(data, ws) {
 
  wss.clients.forEach(function each(client) {
    
    if (JSON.stringify(client) !== JSON.stringify(ws) && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

/* 客户端接入，触发 connection */
wss.on("connection", function connection(ws, req) {
    console.log(1)
  let ip = req.connection.remoteAddress; // 通过req对象可以获得客户端信息，比如：ip，headers等
  /* 客户端发送消息，触发 message */
  ws.on("message", function incoming(message) {
    console.log(message)
    ws.send(message); // 向客户端发送消息
    wss.broadcastToElse(message, ws); // 向 其他的 客户端发送消息，实现群聊效果
  });
});