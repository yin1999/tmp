import { initializeApp } from 'firebase/firebase-app.js'
import { initializeAnalytics } from 'firebase/firebase-analytics.js'
import { getMessaging, getToken, deleteToken, onMessage } from 'firebase/firebase-messaging.js'
import { getDatabase, ref, onValue } from 'firebase/firebase-database.js'
import firebaseConfig from "./config.js"

const subscribeURL = "//firebase-subscribe-k2xj5acqmq-uc.a.run.app/"
const serviceWorker = "./firebase-messaging-sw.js"

/**
 * 
 * @param {Object.<string, string>} items
 */
function showGame(items) {
	const gameList = document.querySelector("#gameList")
	if (Object.keys(items).length === 0) {
		gameList.replaceChildren(document.createTextNode("暂无免费游戏"))
	}
	const df = new DocumentFragment()
	for (const [title, url] of Object.entries(items)) {
		const webPageLink = document.createElement("a")
		webPageLink.href = `//store.epicgames.com/zh-CN/${url}`
		webPageLink.target = "_blank"
		webPageLink.textContent = title
		const launchAppLink = document.createElement("a")
		// https://eoshelp.epicgames.com/s/question/0D54z000080EnFwCAK/how-is-a-games-launch-uri-determined
		launchAppLink.href = `com.epicgames.launcher://store/${url}`
		launchAppLink.textContent = "启动 Epic Games 商店"

		const p = document.createElement("p")
		p.appendChild(webPageLink)
		p.appendChild(document.createTextNode("（"))
		p.appendChild(launchAppLink)
		p.appendChild(document.createTextNode("）"))

		const li = document.createElement("li")
		li.appendChild(p)
		df.appendChild(li)
	}
	gameList.replaceChildren(df)
}

function isFromNotification() {
	const params = new URLSearchParams(location.search)
	return params.get("from") === "notification"
}

async function init() {
	const firebaseApp = initializeApp(firebaseConfig)
	initializeAnalytics(firebaseApp, {
		cookie_flags: "SameSite=None; Secure; Partitioned"
	})
	const messaging = getMessaging(firebaseApp)
	if (isFromNotification()) {
		// the page is opened from the notification
		onMessage(messaging, (payload) => {
			showGame(payload.data)
		})
	} else {
		const db = getDatabase(firebaseApp)
		const slugRef = ref(db, "freeGames")
		onValue(slugRef, snapshot => {
			showGame(snapshot.val())
		})
	}
	document.querySelector('#sub').addEventListener('click', () => sub(messaging))
	document.querySelector('#unsub').addEventListener('click', () => unsub(messaging))
}

async function sub(messaging) {
	if (Notification.permission !== "granted") {
		if (!confirm('请授予通知权限')) {
			return
		}
		const permission = await Notification.requestPermission()
		if (permission !== "granted") {
			alert('未授予通知权限')
			return
		}
	}
	try {
		const token = await getToken(messaging, {
			vapidKey: "BBxTI5zZIw6TOuASd1U9tb-Ye4zQONJPvaaw_0iCbX63-vvon7nuOnyzklBsFtbuULsT77PPcvKaoWtC6o6unDY",
			serviceWorkerRegistration: await registerServiceWorker(true)
		})
		const res = await fetch(subscribeURL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ method: "subscribe", token })
		})
		if (res.ok) {
			localStorage.setItem('token', token)
			alert('订阅成功')
		} else {
			const body = await res.json()
			throw new Error(body.message)
		}
	} catch (e) {
		if (e instanceof TypeError) {
			alert('请求失败')
		} else {
			alert(`订阅失败：${e.message}`)
		}
	}
}

async function unsub(messaging) {
	const token = localStorage.getItem('token')
	if (token) {
		localStorage.removeItem('token')
		fetch(subscribeURL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ method: "unsubscribe", token })
		})
	}
	// Workaround for https://github.com/firebase/firebase-js-sdk/issues/8621
	// provide the service worker registration to the messaging instance
	if (!messaging.swRegistration) {
		messaging.swRegistration = await registerServiceWorker()
	}
	const success = await deleteToken(messaging)
	await unregisterServiceWorker()
	if (success) {
		alert("退订成功")
	} else {
		alert("退订失败")
	}
}

/**
 * Register and update the service worker.
 * Inspired by https://github.com/firebase/firebase-js-sdk/blob/main/packages/messaging/src/helpers/registerDefaultSw.ts
 * @param {boolean} throwErr 
 */
async function registerServiceWorker(throwErr = false) {
	try {
		// check if service worker has been registered
		const registration = await navigator.serviceWorker.register(serviceWorker, {
			type: "module"
		})
		registration.update().catch(() => {})
		// wait for the service worker to be active
		await waitForRegistrationActive(registration)
		return registration
	} catch (err) {
		if (throwErr) {
			throw new Error("register service worker failed", { cause: err })
		} else {
			console.error("register service worker failed", err)
		}
	}
}

/**
 * @param {ServiceWorkerRegistration} registration 
 * @returns {Promise<void>}
 */
async function waitForRegistrationActive(registration) {
	const defaultTimeout = 10000
	return new Promise((resolve, reject) => {
		const rejectTimeout = setTimeout(
			() =>
				reject(
					new Error(
						`Service worker not registered after ${defaultTimeout} ms`
					)
				),
			defaultTimeout
		)
		const incomingSw = registration.installing || registration.waiting
		if (registration.active) {
			clearTimeout(rejectTimeout)
			resolve()
		} else if (incomingSw) {
			incomingSw.onstatechange = ev => {
				if (ev.target?.state === "activated") {
					incomingSw.onstatechange = null
					clearTimeout(rejectTimeout)
					resolve()
				}
			}
		} else {
			clearTimeout(rejectTimeout)
			reject(new Error('No incoming service worker found.'))
		}
	})
}

async function unregisterServiceWorker() {
	const registration = await navigator.serviceWorker.getRegistration(serviceWorker)
	if (registration) {
		await registration.unregister()
	}
}

init()

// add event listener for the service worker
navigator.serviceWorker.addEventListener('message', (evt) => {
	const internalPayload = evt.data
	// workaround: ignore the message sent by firebase messaging
	if (!internalPayload.isFirebaseMessaging) {
		showGame(internalPayload)
	}
})
