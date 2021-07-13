var myName;
var myID;
//console.log(socket)
var videoCallID;
//Create a new room
function onCreateRoomPopUp(){
	var name = document.getElementById('TypeBox').value
	if(name.length>0){
		onCreateRoomEnter(name)
	}
}

//Join a room
function onJoinRoomPopUp(){
	var roomID = document.getElementById('TypeBoxJoin').value
	if(roomID.length>0){
		var n = roomID.lastIndexOf('/');
		roomID = roomID.substring(n + 1);
		console.log("mmm",roomID)
		onJoinRoomEnter(roomID)
	}
}

function onJoinRoomEnter(roomID){
	var socket = io('/')
	console.log("ok")
	socket.emit('sendJoinID',roomID,myID,myName)
	var name
	socket.on('takeName',roomName=>{
		name = roomName
		console.log(name)
		var rowRef = document.getElementById('TableRooms')
		// Insert a row at the end of table
		var newRow = rowRef.insertRow();

		// Insert a cell at the end of the row
		var newCell = newRow.insertCell();

		var button = document.createElement("BUTTON");
		button.className = "btn";
		button.innerHTML = name;
		button.id = roomID
		button.value = 0
		//btn.onclick = (function(entry) {return function() {chooseUser(entry);}})(entry);
		newCell.appendChild(button);
		$(button).on('click',function(){
			//console.log($(this))
			onClickaRoom($(this))
		})
		socket.close()

	})

	
	//socket.emit('generateIDs',name)
	
}

function onCreateRoomEnter(name){
	var socket = io('/')
	console.log("ok")
	var rowRef = document.getElementById('TableRooms')
	// Insert a row at the end of table
	var newRow = rowRef.insertRow();

	// Insert a cell at the end of the row
	var newCell = newRow.insertCell();

	var button = document.createElement("BUTTON");
	button.className = "btn";
	button.innerHTML = name;
	button.value = 0
	//btn.onclick = (function(entry) {return function() {chooseUser(entry);}})(entry);
	newCell.appendChild(button);
	$(button).on('click',function(){
		//console.log($(this))
		onClickaRoom($(this))
	})

	socket.emit('generateIDs',name,myID,myName)
	
	socket.on('sendRoomID',id =>{
		button.id = id;
		socket.close()
	})
}

//All room buttons listener 
var currRoom = null
var prevButton;
function onClickaRoom(button){
	//Upload previous chats
	//socket = io('/')
	if(currRoom==null){
		var svgill = document.getElementsByClassName("illus")
		console.log(svgill[0])
		svgill[0].style.display = "none"
		var header = document.getElementsByClassName('header')
		header[0].style.display = 'flex'
		var chat = document.getElementsByClassName('chatArea')
		chat[0].style.display = 'flex'
		var type = document.getElementsByClassName('typeArea')
		type[0].style.display = 'flex'
	}
	if(currRoom!=button[0].id){
		console.log("del")
		$('.chats').empty();
	}
	if(prevButton!=null){
		prevButton.style.backgroundColor =  '#363536';
	}
	button[0].style.backgroundColor =  '#8160ce6e';
	videoCallID = button[0].id
	var url = ("https://ananyateams.herokuapp.com/" + videoCallID)
	var ur = document.getElementById('Link')
	console.log(ur)
	ur.value = url;
	console.log(ur.value)
	console.log(button[0].id)
	currRoom = button[0].id
	console.log(button[0].value)
	if(button[0]!=prevButton){
		socket.emit('getPrevChats',button[0].id,0)
		button[0].value = 1;
	}
	else{
		socket.emit('getPrevChats',button[0].id,1)
	}
	prevButton = button[0];
	

	//Set video call id to the roomid associated with that room
	
}

const socket = io('/')
socket.emit('getAllRooms')
socket.on('prevRooms',roomsArr =>{
	for(let i=0;i<roomsArr.length;i++){
		var rowRef = document.getElementById('TableRooms')
		// Insert a row at the end of table
		var newRow = rowRef.insertRow();

		// Insert a cell at the end of the row
		var newCell = newRow.insertCell();

		var button = document.createElement("BUTTON");
		button.className = "btn";
		button.innerHTML = roomsArr[i].name;
		button.id = roomsArr[i].id;
		button.value = 0
		//btn.onclick = (function(entry) {return function() {chooseUser(entry);}})(entry);
		newCell.appendChild(button);
		$(button).on('click',function(){
			//console.log($(this))
			onClickaRoom($(this))
		})
	}

})

//Sending chats on group rooms

let text = $('input')
$('html').keydown((e) =>{
	if(e.which == 13 && text.val().length!=0){
		console.log(text.val())
		
		socket.emit('messageGrp',text.val(),myName,myID);
		text.val('')
	}
})

//Creating chat message for all connected users after socket has brodcasted to them
socket.on('createChatGrp', msg =>{
	console.log("this"+msg.message)
	console.log(msg.userID, myID)
	if(msg.userID != myID){
		$('.chats').append(`<li class = "message"><b>${msg.userName}</b><br/>${msg.message}<br/></li>`)
	}
	else{
		$('.chats').append(`<li class = "myMessage"><b>${msg.userName}</b><br/>${msg.message}<br/></li>`)
	}
	scrollChat()
	
})
//Scrolling functionality if overflowed 
function scrollChat(){
	var chatWindow = $('.chatArea');
	chatWindow.scrollTop(chatWindow.prop("scrollHeight"))
}

//getting previous chats of a room
socket.on('addPrevChatsOnFront',prev =>{
	for(let i=0;i<prev.length;i++){
		if(prev[i].userID != myID){
			$('.chats').append(`<li class = "message"><b>${prev[i].name}</b><br/>${prev[i].message}<br/></li>`)
		}
		else{
			$('.chats').append(`<li class = "myMessage"><b>${prev[i].name}</b><br/>${prev[i].message}<br/></li>`)
		}
	}
})

socket.on('sendMyInfo',userProfile=>{
	if(userProfile != null){
		myName = userProfile.name
		myID = userProfile.sub
	}
})

//Redirect to video call on clicking video button
function onClickVideo(){
	window.location = ("https://ananyateams.herokuapp.com/" + videoCallID)
}

//Getting sharable link 
function onClickLink(){
	var url = document.getElementById('Link')
	url.select();
  url.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

  
}

function onClickLogout(){
	window.location = ("https://ananyateams.herokuapp.com/logout")
}




