const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");

const pty = require("node-pty");
const cors = require("cors");

const ptyProcess = pty.spawn("bash", [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.env.INIT_CWD,
  env: process.env,
});

const app = express();
const server = http.createServer(app);
const io = new SocketServer({
  cors: "*",
});

app.use(cors());
io.attach(server);

ptyProcess.onData((data) => {
  console.log("read :", data);
  io.emit("terminal:data", data);
});

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);

  socket.on("terminal:write", (data) => {
    ptyProcess.write(data);
    console.log("write : ", data);
  });
});

server.listen(9000, () => console.log(`🐳 Docker server running on port 9000`));
