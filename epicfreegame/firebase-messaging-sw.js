import { initializeApp } from "//www.gstatic.com/firebasejs/11.1.0/firebase-app.js"
import { getMessaging, onBackgroundMessage } from "//www.gstatic.com/firebasejs/11.1.0/firebase-messaging-sw.js"

self.addEventListener("install", (evt) => {
	self.skipWaiting()
})

self.addEventListener("onnotificationclick", (evt) => {
	// close the notification
	evt.notification.close()
	evt.waitUntil((async () => {
		// focus the window
		const client = await self.clients.openWindow("./")
		client.postMessage(evt.notification.data)
	})())
})

const firebaseApp = initializeApp({
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
})

const messaging = getMessaging(firebaseApp)
onBackgroundMessage(messaging, (payload) => {
	// check if the payload is a notification
	if (payload.notification) {
		// the notification is displayed automatically,
		// skip the rest of the function
		return
	}
	/** @type {(Object.<string, string>|null)} data */
	const data = payload.data;
	if (!data) {
		console.error("Invalid payload", payload)
		return
	}
	// handle the message
	const title = `Epic free games: ${len(data)} new game(s) avaliable`
	const options = {
		body: Object.keys(data).join(", "),
		data,
	}
	// show the notification
	self.registration.showNotification(title, options)
})
