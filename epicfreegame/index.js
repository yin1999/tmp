const firebaseConfig = {
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
}

const subscribeURL = "//firebase-subscribe-k2xj5acqmq-uc.a.run.app/"

const app = Vue.createApp({
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
				.then(() => {
					console.log('Have permission')
					return _this.messaging.getToken({ vapidkey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY" })
				})
				.then(token => {
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
			if (slug) {
				this.slugs = slug.split(";")
			}
		},
		getQueryVariable(query, variable) {
			const vars = query.split("&")
			for (const v of vars) {
				const pair = v.split("=")
				if (pair[0] === variable) {
					return pair[1]
				}
			}
			return false
		}
	},
	created() {
		let slug = this.getQueryVariable(window.location.search.substring(1), "slug")
		this.showGame(slug)
		firebase.initializeApp(firebaseConfig)
		firebase.analytics()
		this.messaging = firebase.messaging()
		this.messaging.onMessage(payload => {
			console.log(payload)
			const options = {
				body: payload.notification.body,
				icon: payload.notification.image,
			}
			const i = payload.notification.click_action.indexOf('?')
			slug = this.getQueryVariable(payload.notification.click_action.substring(i + 1), "slug")
			this.showGame(slug)
			new Notification(payload.notification.title, options)
		})
	}
})

app.use(ElementPlus)
app.mount('#app')
