//based on https://dribbble.com/shots/3913847-404-page

const el = document.querySelector('.box__ghost-eyes')

document.onmousemove = event => {
	//verticalAxis
	const mouseY = event.pageY
	let yAxis = 150 - mouseY / window.innerHeight * 300
	if (yAxis < 0) {
		yAxis = 0
	}
	//horizontalAxis
	const mouseX = event.pageX / window.innerWidth
	const xAxis = mouseX * 100 - 100

	el.style.transform = 'translate(' + xAxis + '%,-' + yAxis + '%)'
}

function goBack() {
	if (history.length >= 2) {
		history.back()
	} else {
		window.close()
	}
}
