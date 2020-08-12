const users=[]

//Add User
const addUser=({id, username, room})=>{
    //clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //Validate data
    if(!room || !username){
        return {
            error: 'Invalid username or room!'
        }
    }

    //check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })

    if(existingUser){
        return {
            error: 'Username is already used!'
        }
    }

    //store user
    const user={
        id,
        username,
        room
    }
    users.push(user)
    return {user}
}

//remove user
const removeUser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })
    if(index !== -1) {
        return users.splice(index, 1)[0]
    }

}

//get user by id
const getUser=(id)=>{
    const user=users.find((user)=>{
        return user.id===id
    })

    return user
    
}

//get users by room
const getUsersInRoom=(room)=>{
    const usersInRoom=users.filter((user)=>{
        return user.room===room
    })

    return usersInRoom
}


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
    