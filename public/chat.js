//Setting up chat messanger inside a call room
//Taking input from the user
let grpSock = false;

/*var filename= location.pathname.split('/').pop();
if(filename == "groupRooms"){
	grpSock = true;
}*/

let text = $('input')
$('html').keydown((e) =>{
	if(e.which == 13 && text.val().length!=0){
		console.log(text.val())
		
		socket.emit('message',text.val(),myName,myLoginId);
		text.val('')
	}
})

//Creating chat message for all connected users after socket has brodcasted to them
socket.on('createChat', msg =>{
	console.log("this"+msg.message)
	if(msg.userID != myID){
		$('.chats').append(`<li class = "message"><b>${peopleJoined[msg.userID].name}</b><br/>${msg.message}<br/></li>`)
	}
	else{
		$('.chats').append(`<li class = "myMessage"><b>${myName}</b><br/>${msg.message}<br/></li>`)
	}
	scrollChat()
	
})
//Scrolling functionality if overflowed 
function scrollChat(){
	var chatWindow = $('.chatArea');
	chatWindow.scrollTop(chatWindow.prop("scrollHeight"))
}