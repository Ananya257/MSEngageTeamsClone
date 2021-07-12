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
const {MongoClient} = require('mongodb')
const urldb = "mongodb+srv://anna257:ananya@cluster0.vhioq.mongodb.net/AnanyaTeams?retryWrites=true&w=majority"
const {v4: uuidV4} = require('uuid')
const roomName = "ab"
//const callURL = "https://ananyateams.herokuapp.com/" + RoomID
//console.log(callURL)

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

const client = new MongoClient(urldb,{useNewUrlParser: true,  useUnifiedTopology: true})

	client.connect()

//Setting up view engine
runExp.set('view engine','ejs')
runExp.use(express.static('public'))
const RoomID = uuidV4()
let redirected = false;


runExp.get('/', (req,res) =>{
	if(req.oidc.isAuthenticated()){
		res.redirect('groupRooms')
	}
	else{
		res.render('landingPage')
	}
})



runExp.get('/landingPage', (req, res) =>{
	res.render('landingPage')
})






async function listDatabases(client) {
	const databasesList = await client.db().admin().listDatabases()

	databasesList.databases.forEach(db =>{
		console.log(`-${db.name}`)
	})
	//console.log(client.db())
}

async function createDocumentForThisRoom(client, RoomID, roomName){
	var callURL = "https://ananyateams.herokuapp.com/" + RoomID
	await client.db("AnanyaTeams").collection("Rooms").updateOne({_id: RoomID }, 
		{$setOnInsert: {
		_id: RoomID,
		name: roomName,
		url: callURL,
		chats: [],

	}}, {upsert: true})
}

//Getting info of user from auth0
var userProfile;
var userName;

async function createDocumentForThisUser(client){
	console.log(userProfile.sub)
	await client.db("AnanyaTeams").collection("Users").updateOne({_id: userProfile.sub }, 
		{$setOnInsert: {_id: userProfile.sub, name: userProfile.name, rooms: [] }}, {upsert: true})
}

function updateUserRooms(client,id,name,myID,myName){
	if(userProfile!=null){
		client.db("AnanyaTeams").collection("Users").updateOne(
			{ _id: myID },
			{ $push: { rooms: {id: id , name:name}} }
		)
	}
}

async function readChatsFromRoom(client,id,socket){
	const result = await client.db("AnanyaTeams").collection("Rooms").findOne({ _id: id });
	console.log(result.chats)
		if(result.chats.length>0){
			socket.emit('addPrevChatsOnFront',result.chats)
		}
}

async function getRoomNameFromdb(client,id,socket,myID,myName){
	const result = await client.db("AnanyaTeams").collection("Rooms").findOne({ _id: id });
	console.log(result.name)
	socket.emit('takeName',result.name)
	updateUserRooms(client,id,result.name,myID,myName)
}

async function getAllRoomsOfUsers(client,socket){
	if(userProfile!=null){
	const result = await client.db("AnanyaTeams").collection("Users").findOne({ _id: userProfile.sub });
	console.log(result.rooms)
	socket.emit('prevRooms',result.rooms)
	}
}


let login = false;
runExp.get('/groupRooms', (req, res) =>{
		res.render('groupRooms')
	userProfile = (req.oidc.user)
	console.log(userProfile)
	console.log(1)
	if(userProfile!=null){
		login = true;
		userName = userProfile.name
		createDocumentForThisUser(client)
	}
	else{
		userName = "Anonymous"
	}
})
let userCurrRoomID = null;
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
	redirected = true;
	//mongoConnect().catch(console.error)
})

//Connect to mongodb (database)
//async function mongoConnect(){
	
	//connectingToClient(client)
	
	//If login/sign up check in user db if exist or not 
	/*Open grp room for that user : take all room ids from it's user db and now use this id in room 
	collection and add names in grp page*/
		console.log('this')
	//establishing connection between a call room and other users
 socketIO.on('connection', socket =>{
	 console.log("here")
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
			 console.log(userCurrRoomID)
			 console.log(0)
			client.db("AnanyaTeams").collection("Rooms").updateOne(
				{ _id: roomId},
				{ $push: { chats: {name: userName,message: message, userID: userProfile.sub }} }
			 )
			socketIO.to(roomId).emit('createChat',({message: message, userID: userID}))
		})


	})
	socket.emit('sendMyInfo',userProfile)

	socket.on('getAllRooms',()=>{
		if(userProfile!=null){
			getAllRoomsOfUsers(client,socket)
		}
	})
	socket.on('generateIDs',(name,myID,myName) =>{
		var id = uuidV4()
		socket.emit('sendRoomID',id)
		console.log('y')
		console.log(name,id)
		createDocumentForThisRoom(client, id, name)
		updateUserRooms(client,id,name,myID,myName)
		
	})

	socket.on('getPrevChats',(id,flag)=>{
		//set roomid for chat on grp to this id
		console.log("ppp"+userCurrRoomID)
		if(userCurrRoomID!=null){
			socket.leave(userCurrRoomID)

		}
		userCurrRoomID = id
		if(flag==0){
			readChatsFromRoom(client,id,socket)
		}
		socket.join(id)
		socket.broadcast.to(id).emit('connected')

		//from rooms db read all chat array corresponding to this id 
		console.log("why")
		

		
	})

	socket.on('messageGrp', (message,myName,myID) =>{
		console.log(userCurrRoomID)
		console.log("now")
		console.log("m",message)
		console.log("id: ",)
	   client.db("AnanyaTeams").collection("Rooms").updateOne(
		   { _id: userCurrRoomID},
		   { $push: { chats: {name: myName,message: message, userID: myID }} }
		)
	   socketIO.to(userCurrRoomID).emit('createChatGrp',({message: message, userID: myID, userName: myName }))
   })

   socket.on('sendJoinID',(roomID,myID,myName) =>{
	   console.log("yyyy" ,roomID)
		getRoomNameFromdb(client,roomID,socket,myID,myName)

   })

	socket.on('disconnect', () => {
		socket.leave(userCurrRoomID)
		console.log('user disconnected');
	  });

	

})
console.log("p")

/*}catch(err){
	console.error(err)
	}/*finally{
	await client.close()
	}

}*/


//when everyone leaves close the  : when grp room is closed or logout

server.listen(process.env.PORT || 3000)

