import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics"
import { getMessaging, getToken, deleteToken } from 'firebase/messaging'

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

const app = createApp({
	data() {
		return {
			slugs: [],
			subLoading: false,
			messaging: null
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
					return getToken(this.messaging, { vapidKey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY" })
				})
				.then(token => {
					fetch(subscribeURL, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							method: "subscribe",
							token
						})
					})
						.then(resp => {
							if (resp.status !== 200) {
								return resp.json()
							}
							_this.$message({
								message: '订阅成功',
								type: 'success'
							})
						})
						.then(errMsg => {
							if (errMsg) {
								throw errMsg.message
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
			deleteToken(this.messaging)
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
		getQueryVariable(query, name) {
			const params = new URLSearchParams(query)
			return params.get(name)
		}
	},
	created() {
		let slug = this.getQueryVariable(window.location.search.substring(1), "slug")
		this.showGame(slug)
		const firebaseApp = initializeApp(firebaseConfig)
		getAnalytics(firebaseApp)
		this.messaging = getMessaging(firebaseApp)
	}
})

app.use(ElementPlus)
app.mount('#app')
