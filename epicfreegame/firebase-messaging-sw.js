import { initializeApp } from "//www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getMessaging } from "//www.gstatic.com/firebasejs/10.8.1/firebase-messaging-sw.js";

// add event listener for notification click
// this should prevent the default behavior of FCM messages
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	console.log(event.notification.data);

	const url = new URL(
		event.notification.data.url ?? self.registration.scope,
		self.location.origin
	);

	if (url.hostname !== self.location.hostname) {
		event.waitUntil(clients.openWindow(url.href));
		return;
	}

	// match all windows
	event.waitUntil(
		clients.matchAll({ type: "window" }).then((clientList) => {
			let bestClient = null;
			for (const client of clientList) {
				const clientUrl = new URL(client.url, self.location.origin);
				if (clientUrl.pathname === url.pathname) {
					bestClient = client;
					break;
				}
				if (
					url.pathname.startsWith(clientUrl.pathname) &&
					(!bestClient ||
						clientUrl.pathname.length > bestClient.url.pathname.length)
				) {
					bestClient = client;
				}
			}
			if (bestClient && "focus" in bestClient) {
				// focus on the best client and reload with specific query
				bestClient.focus();
				const clientUrl = new URL(client.url, self.location.origin);
				if (clientUrl.search !== url.search && "navigate" in bestClient) {
					bestClient.navigate(url.href);
				}
				return;
			}
		// else open a new window
			clients.openWindow(url.href);
		})
	);
});

const firebaseApp = initializeApp({
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY",
});

getMessaging(firebaseApp);
