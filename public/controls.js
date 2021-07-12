//Toggle chat window
var chatStatus = false;
function ChatWindowToggle(){
	var screenr = document.getElementsByClassName("screenright")
	var screenl = document.getElementsByClassName("screenleft")
	//If no chat window is open
	if(!chatStatus){
		const html = `<i class="bi bi-chat-left-dots"></i>`
		document.querySelector(".chatButton").innerHTML = html
		for (var i = 0; i < screenr.length; i++) {
			screenr[i].style.display = "flex";
			screenr[i].style.flex = 0.23;

		  }
		for (var i = 0; i < screenl.length; i++) {
			screenl[i].style.flex = 0.77;

		  }
	}
	//If chat window is open
	else{
		const html = `<i class="bi bi-chat-left-dots-fill"></i>`
		document.querySelector(".chatButton").innerHTML = html
		for (var i = 0; i < screenr.length; i++) {
			screenr[i].style.display = "none";
			screenr[i].style.flex = 0;

		  }
		for (var i = 0; i < screenl.length; i++) {
			screenl[i].style.flex = 1;

		  }

	}
	chatStatus = !chatStatus
}


//Mic & Camera toggle

function Toggle(){
	const enabled = myStream.getAudioTracks()[0].enabled
	if(enabled){                       					// when mic is on
		myStream.getAudioTracks()[0].enabled = false
		setOnButton(true);
	}
else{													//when mic is off
		setOffButton(true);
		myStream.getAudioTracks()[0].enabled = true
	}

}

function VideoToggle(){
	const enabled = myStream.getVideoTracks()[0].enabled
	if(enabled){
		myStream.getVideoTracks()[0].enabled = false
		setOnButton(false);
	}
	else{
		setOffButton(false);
		myStream.getVideoTracks()[0].enabled = true
	}

}

//Setting the icon for mic and camera on toggling 
function setOnButton(mic){
	if(mic){
		const html = `<i class="bi bi-mic-mute-fill"></i>`
		document.querySelector(".mic").innerHTML = html
	}
	else{
		const html = `<i class="bi bi-camera-video-off-fill"></i>`
		document.querySelector(".camera").innerHTML = html
	}
	
}

function setOffButton(mic){
	if(mic){
		const html = `<i class="bi bi-mic-fill"></i></i>`
		document.querySelector(".mic").innerHTML = html
	}
	else{
		const html = `<i class="bi bi-camera-video-fill"></i>`
		document.querySelector(".camera").innerHTML = html
	}
	
}

function onLeave(){
	window.location = "https://ananyateams.herokuapp.com/groupRooms"
}

function onClickLink(){
	var url = document.getElementById('Link')
	url.select();
  url.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

  
}



