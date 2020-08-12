const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
const $imageUpload = document.querySelector('#share-pic')


//template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const imageTemplate = document.querySelector('#image-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//autoscroll
const autoScroll = () => {
    //get newest message
    const $newMessage = $messages.lastElementChild

    //get height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height of scroll bar
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const contentHeight = $messages.scrollHeight

    //how far scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (msg) => {
    //console.log('here:', msg);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location) => {
    //console.log(location);
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()

})

//image received listener
socket.on('addImage', ({ username, imageUrl, createdAt }) => {
    const html = Mustache.render(imageTemplate, {
        username,
        createdAt: moment(createdAt).format('h:mm:ss a'),
        imageUrl
    })

    $messages.insertAdjacentHTML('beforeend', html)
})


socket.on('roomData', ({ room, users }) => {
    console.log('room is', room);
    console.log('user is', users);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //console.log($imageUpload.value);

    //disable wont be able to resend until the current message is sent
    $messageFormButton.setAttribute('disabled', 'disabled')


    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {


        //enable the button
        $messageFormButton.removeAttribute('disabled')

        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            alert('No bad allowed in this room!')
            return console.log('error');

        }
        console.log('message delivered');
    })

})

$locationButton.addEventListener('click', () => {


    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }

    //disable the button until the location is sent to the server
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }
        socket.emit('sendLocation', location, (message) => {
            //enable the send location button
            $locationButton.removeAttribute('disabled')
            console.log(message);
        })
    })
})

//upload user image to the server socket
$imageUpload.addEventListener('change', function (e) {

    var input = e.target
    //console.log('file is ', input);

    var reader = new FileReader();
    reader.onload = function (evt) {
        socket.emit('userImage', evt.target.result, (msg)=>{
            console.log('image received');
        })
    }

    reader.readAsDataURL(input.files[0])

})


socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

