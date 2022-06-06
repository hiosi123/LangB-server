const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    name: String,
    room: String,
    message: String,
})

const Chat = mongoose.model("Chat", chatSchema)

module.exports = Chat