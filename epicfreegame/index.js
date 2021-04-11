const firebaseConfig = {
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
}

new Vue({
	el: "#app",
	data: function() {
		return {
			slugs: []
		}
	},
	created: function () {
		const slug = getQueryVariable("slug")
		if (slug) {
			let t = []
			slug.split(";").forEach(v => {
				t.push({
					slug: v,
					name: v
				})
			})
			this.slugs = t
		}
	}
})

function getQueryVariable(variable) {
	const query = window.location.search.substring(1)
	const vars = query.split("&")
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split("=")
		if (pair[0] === variable) {
			return pair[1]
		}
	}
	return false
}

firebase.initializeApp(firebaseConfig);
firebase.analytics();

const messaging = firebase.messaging()
const subscribeURL = "https://asia-east2-triple-silo-294123.cloudfunctions.net/firebase-subscribe"

function sub() {
	Notification.requestPermission()
		.then(function () {
			console.log('Have permission')
			return messaging.getToken({ vapidkey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY" })
		})
		.then(function (token) {
			fetch(subscribeURL + "?subscribe=1&token=" + token)
				.then(function (response) {
					if (response.status === 200) {
						alert("订阅成功")
					} else {
						alert("订阅失败")
					}
					return response.text()
				})
				.then(function (data) {
					console.log(data)
				})
				.catch(function (e) {
					console.log(e)
					alert("订阅失败")
				})
		})
		.catch(function (err) {
			console.log(err)
		})
}

function unsub() {
	messaging.deleteToken()
	alert("退订成功")
}

messaging.onMessage((payload) => {
	const title = payload.notification.title || 'Background Message Title'
	const options = {
		body: payload.notification.body || 'empty message body',
		icon: payload.notification.image,
		click_action: payload.data.url
	}
	self.registration.showNotification(title, options)
})
