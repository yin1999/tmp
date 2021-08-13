const firebaseConfig = {
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
}

const subscribeURL = "https://firebase-subscribe-k2xj5acqmq-uc.a.run.app/"

new Vue({
	el: "#app",
	data() {
		return {
			slugs: [],
			subLoading: false,
			messaging: {}
		}
	},
	methods: {
		sub() {
			const _this = this
			if (Notification.permission !== "granted") {
				this.$message({
					message: '请授予通知权限',
					type: 'info'
				})
			}
			this.subLoading = true
			Notification.requestPermission()
				.then(function () {
					console.log('Have permission')
					return _this.messaging.getToken({ vapidkey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY" })
				})
				.then(function (token) {
					fetch(subscribeURL, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							method: "subscribe",
							token: token
						})
					})
						.then(resp => resp.json())
						.then(res => {
							if (res.status === 'ok') {
								_this.$message({
									message: '订阅成功',
									type: 'success'
								})
							} else {
								_this.$message({
									message: '订阅失败',
									type: 'error'
								})
								console.log(res)
							}
						})
						.catch(err => {
							_this.$message({
								message: '请求失败',
								type: 'error'
							})
							console.error(err)
						})
				})
				.catch(err => {
					_this.$message({
						message: '未获得通知授权',
						type: 'error'
					})
					console.error(err)
				})
				.finally(() => {
					_this.subLoading = false
				})
		},
		unsub() {
			this.messaging.deleteToken()
			this.$message({
				message: "退订成功",
				type: "success",
			})
		},
		showGame(slug) {
			this.slugs = slug.split(";")
		}
	},
	created() {
		let slug = getQueryVariable(window.location.search.substring(1), "slug")
		if (slug) {
			this.showGame(slug)
		}
		firebase.initializeApp(firebaseConfig);
		firebase.analytics()
		this.messaging = firebase.messaging()
		this.messaging.onMessage(payload => {
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
