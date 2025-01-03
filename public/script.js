// Import Firebase Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWAPW9RDA5D7fGfthDQ7Kz3mNUd5vtR08",
    authDomain: "chat-aac94.firebaseapp.com",
    databaseURL: "https://chat-aac94-default-rtdb.firebaseio.com",
    projectId: "chat-aac94",
    storageBucket: "chat-aac94.appspot.com",
    messagingSenderId: "447978848718",
    appId: "1:447978848718:web:7972945ac94f388b572b9f",
    measurementId: "G-7EWE1EYGRM"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

const PHONE_NUMBER = "+1751936911";

const messageInput = document.getElementById('message-input');
const microphoneButton = document.getElementById('microphone-button');
const sendButton = document.getElementById('send-button');
const emojiIcon = document.getElementById('emoji-icon');
const recorderIcon = document.getElementById('recorder-icon');

let recorder, microphone, startTime, timerInterval;

// Format time as "m:ss"
function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        messageInput.placeholder = formatTime(elapsedTime); // Update placeholder with timer
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    messageInput.placeholder = 'Type a message...';
}

// Monitor input for toggling buttons
messageInput.addEventListener('input', function () {
    if (messageInput.value.trim() === '') {
        microphoneButton.style.display = 'block';
        sendButton.style.display = 'none';
    } else {
        microphoneButton.style.display = 'none';
        sendButton.style.display = 'block';
    }
});

// Handle microphone button click
microphoneButton.addEventListener('click', function () {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (mic) {
            microphone = mic;
            recorder = new RecordRTC(microphone, { type: 'audio' });
            recorder.startRecording().then(() => {
                console.log("Recording started");
            }).catch(err => console.error("Error starting recording:", err));

            // UI Updates
            messageInput.placeholder = "0:00";
            microphoneButton.style.display = 'none';
            sendButton.style.display = 'block';
            emojiIcon.style.display = 'none';
            recorderIcon.style.display = 'inline';
            startTimer();

            messageInput.readOnly = true;
        })
        .catch(function (error) {
            console.error("Microphone access denied:", error);
            alert("Please grant microphone access.");
        });
});

// Handle send button click
sendButton.addEventListener('click', function () {
    if (messageInput.value.trim() !== '') {
        sendMessage('+1234567890', messageInput.value.trim());
        resetUI();
    } else if (recorder) {
        recorder.stopRecording(function () {
            const audioBlob = recorder.getBlob();
            sendMessage('+1234567890', '', audioBlob);
            resetUI();

            recorder.clearRecordedData();
            recorder = null;

            if (microphone) {
                microphone.getTracks().forEach(track => track.stop());
                microphone = null;
            }
        });
    }
});

// Reset UI after sending
function resetUI() {
    microphoneButton.style.display = 'block';
    sendButton.style.display = 'none';
    stopTimer();
    recorderIcon.style.display = 'none';
    emojiIcon.style.display = 'inline';
    messageInput.readOnly = false;
    messageInput.value = '';
}

// Send message (text or audio)
async function sendMessage(user, messageText, mediaFile) {
    const timestamp = new Date().toISOString();
    const messageId = `EYENET${Date.now()}`;
    let mediaURL = null;

    if (mediaFile) {
        const mediaPath = `chat_media/${messageId}.webm`;
        const mediaRef = storageRef(storage, mediaPath);
        const snapshot = await uploadBytes(mediaRef, mediaFile);
        mediaURL = await getDownloadURL(snapshot.ref);
    }

    const message = {
        from: PHONE_NUMBER,
        to: user,
        message: messageText || '',
        messageId,
        timestamp,
        mediaURL,
        mediaType: mediaFile ? 'audio' : 'text',
        status: 'sent'
    };

    await set(ref(database, `Users/${PHONE_NUMBER}/messages/${messageId}`), message);
    await set(ref(database, `Users/${user}/messages/${messageId}`), message);
}
