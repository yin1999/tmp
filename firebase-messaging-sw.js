importScripts('https://www.gstatic.com/firebasejs/8.3.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.3.0/firebase-messaging.js')

firebase.initializeApp({
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
})

const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function(payload) {
	const title = payload.notification.title || 'Background Message Title'
	const options = {
		body: payload.notification.body || 'empty message body',
		icon: payload.notification.image,
		data: {slugs:payload.data.slugs},
		actions: [{action: "open_url", title: payload.notification.title}]
	}
	return self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', function(event) {
	if (event.action === 'open_url' && event.notification.data.slugs) {
		const slugs = event.notification.data.slugs.split(';')
		slugs.forEach(slug => {
			clients.openWindow("https://www.epicgames.com/store/zh-CN/p/"+slug)
		})
	}
})
