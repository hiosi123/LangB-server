const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const Chat = require('./models/chat.model')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const router = require('./router');
const { default: mongoose } = require('mongoose');
const { text } = require('express');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

io.on('connect', async (socket) => {

  await socket.on('join',async ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    await socket.join(user.room);
  
    const chatlogs = await Chat.find({ room: room }).exec();

    await socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    if(chatlogs){
      chatlogs.forEach((e) => {
        socket.emit('message',{ user: e.name, text: e.message })
      })
    }
    await socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    await io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  await socket.on('sendMessage', async (message,name,room) => {

    const chat = new Chat({
      name: name,
      room: room,
      message: message
    })
    await chat.save()


    await io.to(room).emit('message', { user: name, text: message });


   
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })
});

mongoose.connect("mongodb://my-database:27017/myDocument")

server.listen(process.env.PORT || 3001, () => console.log(`Server has started.`));