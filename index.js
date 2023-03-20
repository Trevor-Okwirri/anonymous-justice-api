const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const SocketConnection = require("./models/SocketConnect");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const reportRoute = require("./routes/report");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const factRoute = require("./routes/fact");
const storiesRoute = require("./routes/story");
const chatRoute = require("./routes/chat");
const socketIO = require('socket.io');
const http = require('http');
// const cart = re
// const cartRoute = require("./routes/cart");
// const orderRoute = require("./routes/order");
// const stripeRoute = require("./routes/stripe");
const cors = require("cors");
const server = http.createServer(app);
const io = socketIO(server);
dotenv.config();

const mongoLink = "mongodb+srv://trevorokwirri:trevor%401234@anonymous-justice.eppsouf.mongodb.net/?retryWrites=true&w=majority"

mongoose
  .connect("mongodb://127.0.0.1:27017/anonymous-justice")
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/reports", reportRoute);
app.use("/stories", storiesRoute);
app.use("/facts", factRoute);
app.use("/chats", chatRoute);
// app.use("/carts", cartRoute);
// app.use("/orders", orderRoute);
// app.use("/checkout", stripeRoute);
app.get("/", (req, res) => {
  res.send("Hello world")
})

io.on("connection", async (socket) => {
  socket.on("userToken", async (data) => {
      var verifiedUser = ""
      jwt.verify(data, process.env.JWT_SEC,  async (err, user) => {
          if (err) {
            return socket.emit("error",{ message: 'Invalid token' });
          }
          verifiedUser = await User.findById(user.id)
          if(verifiedUser){
              socket.emit(
                  "user", verifiedUser
              )
              try{
                  const connection = new SocketConnection({socketId: socket.id, userId: verifiedUser._id})
                  const savedConnection = await connection.save()
                  socket.emit(
                      "connection", savedConnection
                  )
                  socket.on("chat", async (chat) => {
                      const message = {
                          sender: verifiedUser._id,
                          receiver: chat.to,
                          message: chat.message
                      }
                      let headersList = {
                          "Accept": "*/*",
                          "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                          "Authorization": "Bearer " + data,
                          "Content-Type": "application/json" 
                         }
                         
                         let bodyContent = JSON.stringify({
                           "to": chat.to,
                           "message": chat.message
                         });
                         
                         let reqOptions = {
                           url: process.env.SERVER_URL + "/chats",
                           method: "POST",
                           headers: headersList,
                           data: bodyContent,
                         }
                         
                         let response = await axios.request(reqOptions);
                         socket.emit("response", response.data)
                         try{
                          const receiverSockets = await SocketConnection.find({userId: message.receiver});
                          receiverSockets.forEach((e) => {
                              socket.to(e.socketId).emit("chat", response.data)
                          })
                         }catch(err){
                          socket.emit("error", err)
                         }
                      socket.emit("chat", message)
                  })
              }catch(err){
                  socket.emit("error", err)
              }
          }
      }
      );
  });
  console.log(socket.id + " connected")
  socket.on("disconnect", async (stream) => {
      try {
          await SocketConnection.findOneAndDelete({socketId: socket.id})
      } catch (error) {
          console.log(error)
      }
      console.log(socket.id +" disconnected")
  })
});

server.listen(process.env.PORT ||5000, () => {
  console.log("Backend server is running!");
});
