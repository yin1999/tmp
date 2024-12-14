import { initializeApp } from "//www.gstatic.com/firebasejs/11.1.0/firebase-app.js"
import { getMessaging } from "//www.gstatic.com/firebasejs/11.1.0/firebase-messaging-sw.js"

const firebaseApp = initializeApp({
	apiKey: "AIzaSyALyDL5Ixr4gVf6T5HMlV8W8rH6yiA41ys",
	authDomain: "triple-silo-294123.firebaseapp.com",
	projectId: "triple-silo-294123",
	storageBucket: "triple-silo-294123.appspot.com",
	messagingSenderId: "523905433176",
	appId: "1:523905433176:web:a79c91d198d5246402142d",
	measurementId: "G-PEG3EM3YFY"
})

getMessaging(firebaseApp)
