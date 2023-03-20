const io = require("socket.io")(3000);
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("./models/User");
const SocketConnection = require("./models/SocketConnect");
const mongoose = require("mongoose");
const axios = require("axios");
dotenv.config()

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
                             url: "http://localhost:5000/chats",
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