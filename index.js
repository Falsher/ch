const express = require("express");
const jwt = require("jsonwebtoken");
const userModel = require("./model/User");
const mongoose = require("mongoose");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config;
const authRouter = require("./authRouter");
const app = express();
const http = require("http").createServer(app);

const { DB_HOST, SECRET_KEY, PORT = 8090 } = process.env;

let onlineUsers = [];

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));

app.use(cors());

app.use(express.json());
app.use("/auth", authRouter);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token;
    if (!token) {
      return;
    }

    socket.user = jwt.verify(token, SECRET_KEY);
    // const user = await userModel.find();
    onlineUsers = onlineUsers.filter(({ user, socket }) => {
      if (user.id !== socket.user.id) {
        return { user, socket };
      }

      socket.disconnect(true);
    });

    next();
  } catch (err) {
    console.error(err.message);
  }
});

io.on("connection", async function (socket) {
  onlineUsers.push({ user: socket.user, socket });
  console.log(socket.user);
  if (socket.user.ban) {
    return socket.disconnect(true);
  }
  await userModel.findByIdAndUpdate(socket.user.id, {
    online: true,
  });
  socket.emit("user data", {
    name: socket.user.name,
    online: socket.user.online,
  });
  if (socket.user.role === "ADMIN") {
    socket.on("mute", async ({ idMute, mut }) => {
      await userModel.findByIdAndUpdate(idMute, {
        mute: mut,
      });
      const mutedUserIndex = onlineUsers.findIndex(
        ({ user }) => user.id === idMute
      );

      if (mutedUserIndex != -1) {
        onlineUsers[mutedUserIndex].mute = mut;
      }
    });
    // ------
    socket.on("ban", async ({ idBan, ban }) => {
      console.log(idBan, ban);
      if (ban) {
        const targetUsersConnectionArr = onlineUsers.find(({ user }) => {
          return user.id === idBan;
        });

        if (targetUsersConnectionArr) {
          targetUsersConnectionArr.socket.disconnect(true);
        }

        const removedUserIndex = onlineUsers.findIndex(
          ({ user, socket }) => user.id === idBan
        );
        onlineUsers.splice(removedUserIndex, 1);
      }

      return await userModel.findByIdAndUpdate(idBan, {
        ban,
      });
    });
    const allUsers = await userModel.find(
      {},
      "name color role ban mute online"
    );
    socket.emit("allUsers", {
      allUsers,
    });
  }

  // ----------- user connect online

  socket.on("chat message", async (data) => {
    const {
      user: { id, name },
    } = socket;
    const { message, date } = data;
    const user = await userModel.findById(id);
    await userModel.findByIdAndUpdate(socket.user.id, {
      dateLastMessage: date,
    });

    const currentTime = Date.now();
    if (
      (user.mute && message.length < 200) ||
      (user.dateLastMessage && currentTime - user.dateLastMessage < 15000)
    ) {
      return console.log("error 15 second");
    }
    io.emit("chat message", {
      color: socket.user.color,
      message: message,
      name: socket.user.name,
    });
  });

  socket.on("disconnect", async function () {
    // console.log("discmnjdfvdf");
    await userModel.findByIdAndUpdate(socket.user.id, {
      online: false,
    });
    const users = await userModel.find({}, "name color role ban mute online");

    io.emit("allUsers", {
      users,
    });
  });
});

const start = async () => {
  try {
    await mongoose.connect(DB_HOST);
    http.listen(PORT, () => console.log(`${PORT}`));
  } catch (error) {
    console.log(error.message);
  }
};
start();
