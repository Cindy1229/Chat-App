const express=require ('express')
const path=require('path')
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage, generateLocationMessage}=require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicDirectory=path.join(__dirname, '../public')

app.use(express.static(publicDirectory))


io.on('connection', (socket)=>{
    console.log('new connection')

    

    socket.on('join', ({username, room}, callback)=>{
        const {error, user}=addUser({
            id: socket.id,
            username,
            room
        })

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        //io.to.emit, socket.broadcast.to.emit===>used for rooms
        socket.emit('message', generateMessage(`Bot ${user.room}`, 'Welcome to the chat room!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`Bot ${user.room}`, `${user.username} has joined the room ${user.room}`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()

    })


    socket.on('sendMessage', (msg, callback)=>{
        const user=getUser(socket.id)

        const filter=new Filter()

        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', (location, callback)=>{
        const user=getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.lat},${location.long}`))
        callback('Location shared')
    })

    socket.on('disconnect', ()=>{
        const user=removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the room!`))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })
})



server.listen(port, ()=>{
    console.log('server is on port', port)
})