import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics"
import { getMessaging, getToken, deleteToken } from 'firebase/messaging'

const firebaseConfig = {
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	databaseURL: "https://triple-silo-294123-default-rtdb.firebaseio.com/",
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
		async sub() {
			this.subLoading = true
			if (Notification.permission !== "granted") {
				this.$message({
					message: '请授予通知权限',
					type: 'info'
				})
				const permission = await Notification.requestPermission()
				if (permission !== "granted") {
					this.$message({message: '未授予通知权限', type: 'error'})
					return
				}
			}
			try {
				const token = await getToken(this.messaging, { vapidKey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY" })
				const res = await fetch(subscribeURL, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ method: "subscribe", token })
				})
				if (res.ok) {
					this.$message({message: '订阅成功', type: 'success'})
					localStorage.setItem('token', token)
				} else {
					const body = await res.json()
					throw new Error(body.message)
				}
			} catch (e) {
				if (e instanceof TypeError) {
					this.$message({message: '请求失败', type: 'error'})
				} else {
					this.$message({message: `订阅失败：${e.message}`, type: 'error'})
				}
			}
			this.subLoading = false
		},
		unsub() {
			const token = localStorage.getItem('token')
			if (token) {
				localStorage.removeItem('token')
				fetch(subscribeURL, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ method: "unsubscribe", token })
				})
			}
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
	async created() {
		let slug = this.getQueryVariable(window.location.search.substring(1), "slug")
		this.showGame(slug)
		const firebaseApp = initializeApp(firebaseConfig)
		getAnalytics(firebaseApp)
		this.messaging = getMessaging(firebaseApp)
		if (!slug) {
			const { getDatabase, ref, onValue } = await import('//www.gstatic.com/firebasejs/9.6.6/firebase-database.js')
			const db = getDatabase(firebaseApp)
			const slugRef = ref(db, "freeGameList")
			onValue(slugRef, snapshot => {
				this.slugs = snapshot.val()
			})
		}
	}
})

app.use(ElementPlus)
app.mount('#app')
