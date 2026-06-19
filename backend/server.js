require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join-user-room", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });
});

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
