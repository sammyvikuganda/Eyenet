// Firebase imports
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
    import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
    import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

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
    const recorderIcon = document.getElementById('recorder-icon');  // Recorder Icon
    let recorder, microphone, startTime;
    let timerInterval;

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
            messageInput.placeholder = formatTime(elapsedTime); // Update the placeholder with formatted timer
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        messageInput.placeholder = 'Type a message...'; // Restore the placeholder text when the timer stops
    }

    // Listen for input in the textarea
    messageInput.addEventListener('input', function() {
        if (messageInput.value.trim() === '') {
            microphoneButton.style.display = 'block';
            sendButton.style.display = 'none';
        } else {
            microphoneButton.style.display = 'none';
            sendButton.style.display = 'block';
        }
    });

    microphoneButton.addEventListener('click', function() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function(mic) {
            microphone = mic;
            recorder = new RecordRTC(microphone, { type: 'audio' });
            recorder.startRecording();
            
            messageInput.placeholder = "0:00"; // Show timer immediately on start
            microphoneButton.style.display = 'none';  // Hide microphone button
            sendButton.style.display = 'block';  // Show send button

            // Disable input during recording
            messageInput.readOnly = true;

            // Show the recorder icon and hide the emoji icon
            emojiIcon.style.display = 'none';
            recorderIcon.style.display = 'inline'; // Display the red recorder icon

            startTimer(); // Start timer
        }).catch(function(error) {
            console.error(error);
            alert("Microphone access denied!");
        });
    });

    sendButton.addEventListener('click', function() {
        if (messageInput.value.trim() !== '') {
            // Send Text Message
            sendMessage('+1234567890', messageInput.value.trim());
            messageInput.value = ''; // Clear the input
            sendButton.style.display = 'none';  // Hide send button
            microphoneButton.style.display = 'block';  // Show microphone button again
        } else if (recorder) {
            // Stop Audio Recording and Send it Immediately
            recorder.stopRecording(function() {
                const audioBlob = recorder.getBlob();
                sendMessage('+1234567890', '', audioBlob);
                
                microphoneButton.style.display = 'block';  // Show microphone button
                sendButton.style.display = 'none';  // Hide send button
                
                stopTimer(); // Stop timer

                // Hide the recorder icon and show the emoji icon again
                recorderIcon.style.display = 'none';
                emojiIcon.style.display = 'inline'; // Display the emoji icon

                // Properly stop the recorder and release resources
                recorder.clearRecordedData();  // Clears the recorded data
                recorder = null;  // Nullify the recorder object to prevent it from running

                // Stop the microphone stream (releases the microphone access)
                if (microphone) {
                    microphone.getTracks().forEach(track => track.stop());
                    microphone = null;  // Nullify the microphone object
                }

                // Enable the input again after recording
                messageInput.readOnly = false;
            });
        }
    });

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
