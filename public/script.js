const messageInput = document.getElementById('message-input');
const microphoneButton = document.getElementById('microphone-button');
const sendButton = document.getElementById('send-button');

let recorder, microphone, startTime, timerInterval;

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        messageInput.placeholder = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    messageInput.placeholder = 'Type a message...';
}

microphoneButton.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(mic => {
            microphone = mic;
            recorder = new MediaRecorder(microphone);
            recorder.start();
            startTimer();
        })
        .catch(console.error);
});

sendButton.addEventListener('click', () => {
    stopTimer();
    recorder && recorder.stop();
    // Handle sending the message or recording
});
