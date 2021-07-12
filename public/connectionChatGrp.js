socket = io('/')

let text = $('input')
$('html').keydown((e) =>{
	if(e.which == 13 && text.val().length!=0){
		console.log(text.val())
		
		socket.emit('messageGrp',text.val());
		text.val('')
	}
})

//Creating chat message for all connected users after socket has brodcasted to them
socket.once('createChatGrp', msg =>{
	console.log("this"+msg.message)
	/*if(msg.userID != myID){
		$('.chats').append(`<li class = "message"><b>${peopleJoined[msg.userID].name}</b><br/>${msg.message}<br/></li>`)
	}*/
	//else{
		$('.chats').append(`<li class = "myMessage"><b></b><br/>${msg.message}<br/></li>`)
	//}
	scrollChat()
	
})
//Scrolling functionality if overflowed 
function scrollChat(){
	var chatWindow = $('.chatArea');
	chatWindow.scrollTop(chatWindow.prop("scrollHeight"))
}

