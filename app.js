var http = require('http'),
    fs = require('fs');
//创建http服务器
var server = http.createServer(function (req, res) {
    fs.readFile('./index.html', function (error, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(data, 'utf-8');
    })
}).listen(3000, "127.0.0.1");
console.log("server listening on 3000");//在cmd查看输出日志
var io = require("socket.io").listen(server);//引用socket.io库，并将socket.io绑定到服务器
var count = 0;//记录连接服务器的用户数，服务器启动时，用户数量是0
//给socket.io添加监听事件
io.on('connection', function (socket) {//监听客户端连接到服务器事件
    count++;//客户端加入服务器时，用户数加1
    console.log('user connected:' + count);
    //服务器发送连接服务器用户数给最新连接服务器的单个客户端
    socket.emit('users', {number: count});
    //服务器发送连接服务器用户数给当前所有已连接服务器的客户端。
    // 但是不会发送正在连接中新客户端，因此要使用socket.emit()多发送一次消息给连接中的客户端
    socket.broadcast.emit('users', {number: count});
    socket.on('disconnect', function () {//监听客户端断开连接
        console.log('user disconnected');
        count--;//客户端离时，用户数减一
        console.log('user connected:' + count);
        socket.broadcast.emit('users', {number: count});//服务器发送连接服务器用户数给当前所有已连接服务器的客户端。
    });
    //服务器接收客户端发送的消息
    socket.on('message', function (data) {
        socket.broadcast.emit('push', data);//服务器把客户端的消息广播给所有客户端，除了发送这条消息的客户端
    });
});