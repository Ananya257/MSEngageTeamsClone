const openPopUpButtons = document.querySelectorAll('[data-modal-target]')
const closePopUpButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openPopUpButtons.forEach(button =>{
	button.addEventListener('click', () =>{
		const popUp = document.querySelector(button.dataset.modalTarget)
		openPopUp(popUp)
	})
})

overlay.addEventListener('click',()=>{
	const popUp = document.querySelectorAll('.PopUp.active')
	popUp.forEach(modal =>{
		closePopUp(modal)
	})

})

closePopUpButtons.forEach(button =>{
	button.addEventListener('click', () =>{
		const popUp = button.closest('.PopUp')
		closePopUp(popUp)
	})
})

function openPopUp(popUp){
	if(popUp ==null){
		return;
	}
	popUp.classList.add('active')
	overlay.classList.add('active')
}

function closePopUp(popUp){
	if(popUp ==null){
		return;
	}
	popUp.classList.remove('active')
	overlay.classList.remove('active')
}