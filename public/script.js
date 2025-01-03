let mediaRecorder; 
let audioChunks = [];
const startButton = document.getElementById('start-recording');
const stopButton = document.getElementById('stop-recording');
const audioContainer = document.getElementById('audio-container');

// Start Recording
startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = []; // Clear the chunks for future recordings
            const audioURL = URL.createObjectURL(audioBlob);

            // Create audio element
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = audioURL;

            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = audioURL;
            downloadLink.download = 'recorded-audio.webm';
            downloadLink.textContent = 'Download Audio';

            // Append to the container
            const audioWrapper = document.createElement('div');
            audioWrapper.appendChild(audio);
            audioWrapper.appendChild(downloadLink);

            audioContainer.appendChild(audioWrapper);
        };

        mediaRecorder.start();
        startButton.disabled = true;
        stopButton.disabled = false;
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not access microphone. Please check your permissions.');
    }
});

// Stop Recording
stopButton.addEventListener('click', () => {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
    startButton.disabled = false;
    stopButton.disabled = true;
});
