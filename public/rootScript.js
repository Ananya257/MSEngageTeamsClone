const socket = io('/')
//establishing a host 
const myPeer = new Peer(undefined,{
	config: {'iceServers': [
		{ url: 'stun:stun.l.google.com:19302' },
		{ url: 'stun:stun1.l.google.com:19302'},
		{ url: 'stun:stun2.l.google.com:19302'},
		{ url: 'stun:stun3.l.google.com:19302'},
		{ url: 'stun:stun4.l.google.com:19302'},
		{ url: 'turn:numb.viagenie.ca', credential: 'nunnun', username: "ananya19144@iiitd.ac.in" },
		{ url: 'turn:numb.viagenie.ca', credential: 'nunnun', username: "ananya257singh@gmail.com" },
		{ url: 'turn:numb.viagenie.ca', credential: 'nunnun', username: "rash75singh@yahoo.com" }
	  ]},
	  host: "ananyateams.herokuapp.com",
	  port: "",
	  path: "/peerjs",
})
//Setting up layout for videos
const gridVideo = document.getElementById('GridforVideos')
const myVideo = document.createElement('video')
const videoCont = document.createElement('div')
videoCont.classList.add("video-container");
videoCont.append(myVideo)
myVideo.muted = true;

var myID;
let myStream
var myName
const peopleJoined = {} //all the users that are currently in the same call room
const users = {}

//Creating a new id for this user and asking it to join to the given roomid
myPeer.on('open',id=>{
	console.log(id)
	myID = id;
	//myVideo.id = id;
	videoCont.id = id;
	socket.emit('joinCall',CALL_ID, id)
})

//getUserName
socket.on('getName', userProfile=>{
	if(userProfile!=null){
		myName = userProfile.name
	}
	else{
		myName = "Anonymous"
	}
	addOverlayTextVideo(videoCont,myName)
})


//Permission for video and audio
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true
}).then(stream=>{
	//Start video stream of this current user in it's view
	startVideoLive(myVideo,stream, videoCont)
	myStream = stream;

	// All users that had already joined the room calls new user to connect with them
	myPeer.on('call', call=> {
		//New user for it to connect answers the incoming call
		call.answer(stream)

		//Video object and stream of previous users created for the new user
		const video = document.createElement('video')
		const videoContainer = document.createElement('div')
		videoContainer.classList.add("video-container")
		videoContainer.append(video)
		addOverlayTextVideo(videoContainer,call.metadata.name)

		call.on('stream', userVideoStream =>{
			//video.id = call.metadata.id 
			videoContainer.id = call.metadata.id 
			peopleJoined[call.metadata.id] = {"calltag": call, "name": call.metadata.name}
			startVideoLive(video, userVideoStream, videoContainer)
		})


	})
	// function to connect this user to new users
	socket.on('userConnected',user =>{
		console.log("User Connected: " + user["id"])
		setTimeout(connectOthers,1000,user["id"],stream,user["name"])
	})

	socket.on('userDisconnected',userID =>{
		if(peopleJoined[userID].calltag){
			peopleJoined[userID].calltag.close()
			var videoRemove = document.getElementById(userID);
			if(videoRemove!=null){
				videoRemove.remove();
			}
		}
	})

})


function startVideoLive(video, stream,videoContainer){
	video.srcObject = stream
	video.addEventListener('loadedmetadata',() =>{
		video.play()
	})

	gridVideo.append(videoContainer)

	/*const name = document.createElement("p");
	name.classList.add("name");
	name.append(document.createTextNode(userName))
	videoContainer.append(name);
	console.log(1)*/

}
function addOverlayTextVideo(videoContainer,userName){
	const name = document.createElement("p");
	name.classList.add("name")
	name.append(document.createTextNode(userName))
	videoContainer.append(name)
}

function connectOthers(userID,stream, userName){	
	options = {metadata: {"id":myID , "name" :myName}};	//sending this user's ID to a new user
	const callPeer = myPeer.call(userID,stream,options)
	const video = document.createElement('video')	
	const videoContainer = document.createElement('div')
	videoContainer.classList.add("video-container")
	videoContainer.append(video)
	//video.id = userID
	videoContainer.id = userID 
	addOverlayTextVideo(videoContainer,userName)
	callPeer.on('stream', userVideoStream =>{
		startVideoLive(video, userVideoStream, videoContainer)
	})

	callPeer.on('close',()=>{
		video.remove()
		videoContainer.remove()
	})
	peopleJoined[userID] = {"calltag": callPeer, "name" : userName}
}





