const firebaseConfig = {
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
}

const subscribeURL = "https://asia-east2-triple-silo-294123.cloudfunctions.net/firebase-subscribe"

new Vue({
	el: "#app",
	data: function () {
		return {
			slugs: [],
			messaging: {}
		}
	},
	methods: {
		sub: function () {
			const _this = this
			Notification.requestPermission()
				.then(function () {
					console.log('Have permission')
					return _this.messaging.getToken({ vapidkey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY" })
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
		},
		unsub: function () {
			this.messaging.deleteToken()
			alert("退订成功")
		},
		showGame: function (slug) {
			let t = []
			slug.split(";").forEach(v => {
				t.push({
					slug: v,
					name: v
				})
			})
			this.slugs = t
		}
	},
	created: function () {
		let slug = getQueryVariable(window.location.search.substring(1), "slug")
		if (slug) {
			this.showGame(slug)
		}
		firebase.initializeApp(firebaseConfig);
		firebase.analytics()
		this.messaging = firebase.messaging()
		this.messaging.onMessage((payload) => {
			const title = payload.notification.title || 'Background Message Title'
			console.log(payload)
			const options = {
				body: payload.notification.body || 'empty message body',
				icon: payload.notification.image,
			}
			const i = payload.notification.click_action.indexOf('?')
			slug = getQueryVariable(payload.notification.click_action.substring(i + 1), "slug")
			if (slug) {
				this.showGame(slug)
			}
			new Notification(title, options);
		})
	}
})

function getQueryVariable(query, variable) {
	const vars = query.split("&")
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split("=")
		if (pair[0] === variable) {
			return pair[1]
		}
	}
	return false
}
