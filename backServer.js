const express = require('express')
const runExp = express()
const server = require('http').Server(runExp)
/*const { PeerServer } = require('peer');
const peerServer = PeerServer(server, {
	port: 9000,
	debug: true,
	});*/
/*var ExpressPeerServer = require("peer").ExpressPeerServer;

var peerServer = ExpressPeerServer(server, {
	debug:true
})*/
 //runExp.use("/peerjs", peerServer);

 var ExpressPeerServer = require("peer").ExpressPeerServer;    
var options = {
  debug: true,
  allow_discovery: true,
};
let peerServer = ExpressPeerServer(server, options);
runExp.use("/peerjs", peerServer);

const socketIO = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')

//Setting up authentication of the user using auth0
const { auth } = require('express-openid-connect');
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'https://ananyateams.herokuapp.com',
  clientID: '2FmZimL0g8MvERbSUEbF6Qf7i1nRrgyS',
  issuerBaseURL: 'https://dev-0fr9-x80.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
runExp.use(auth(config));

//Setting up view engine
runExp.set('view engine','ejs')
runExp.use(express.static('public'))

runExp.get('/', (req,res) =>{
	res.redirect(`/${uuidV4()}`)
})

//Getting info of user from auth0
var userProfile;
var userName;
//Sending created roomID to client
runExp.get('/:teamCallRoom', (req, res) =>{
	res.render('teamCallRoom',{roomId: req.params.teamCallRoom})
	userProfile = (req.oidc.user)
	if(userProfile!=null){
		userName = userProfile.name
	}
	else{
		userName = "Anonymous"
	}
})


//establishing connection between a call room and other users
socketIO.on('connection', socket =>{
	socket.on('joinCall',(roomId, userID) => {
		socket.join(roomId)
		//Send user info to client side
		socket.emit('getName', userProfile)
		const user = {"id":userID, "name": userName}

		// whenever a new user all previous users will connect to it
		console.log(userName)
		socket.broadcast.to(roomId).emit('userConnected',user)

		//	when user leaves inform all other users connected to the same room 
		socket.on('disconnect',() =>{
			socket.broadcast.to(roomId).emit('userDisconnected',userID)
		})

		//Send chats of this user to others
		socket.on('message', message =>{
			socketIO.to(roomId).emit('createChat',({message: message, userID: userID }))
		})


	})
})



server.listen(process.env.PORT || 3000)

