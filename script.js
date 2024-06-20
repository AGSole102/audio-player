let images = [
    { src: 'assets/tyler.jpg', comment: 'Tyler, The Creator – Hot Wind Blows', audio: 'https://github.com/AGSole102/audio-player/raw/main/audio/hot_wind.mp3' },
    { src: 'assets/alberto_balsalm.jpg', comment: 'Aphex Twin – Alberto Balsalm', audio: 'https://github.com/AGSole102/audio-player/raw/main/audio/alberto_balsalm.mp3' },
    { src: 'assets/weeknd_playboi_popular.jpg', comment: 'The Weeknd, Playboi Carti – Popular', audio: 'https://github.com/AGSole102/audio-player/raw/main/audio/popular.mp3' },
    { src: 'assets/d4vd.jpg', comment: 'd4vd – Feel It', audio: 'https://github.com/AGSole102/audio-player/raw/main/audio/feel_it.mp3' },
    { src: 'assets/tame_impala.jpg', comment: 'Tame Impala – Borderline', audio: 'https://github.com/AGSole102/audio-player/raw/main/audio/borderline.mp3' },
    { src: 'assets/brent.jpg', comment: 'Brent Faiyaz, Dahi, Tyler, The Creator – GRAVITY', audio: 'https://github.com/AGSole102/audio-player/raw/main/audio/gravity.mp3' }
];

let currentIndex = 0;
let isSoundEnabled = false;
let audioContext, analyser, dataArray, bufferLength, audioSource;
const imgElement = document.getElementById('current-image');
const commentElement = document.getElementById('image-comment');
const audioElement = document.getElementById('pesenki');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

document.getElementById('next').addEventListener('click', showNextImage);
document.getElementById('prev').addEventListener('click', showPrevImage);
audioElement.addEventListener('ended', showNextImage);
window.addEventListener('DOMContentLoaded', () => {
    initAudio();
});

document.getElementById('play-pause').addEventListener('click', togglePlayPause);
document.getElementById('seek-bar').addEventListener('input', seekAudio);
audioElement.addEventListener('timeupdate', updateSeekBar);
document.getElementById('download').addEventListener('click', downloadTrack);

function showNextImage() {
	if (isSoundEnabled) {
		document.getElementById('play-pauseImg').src = 'assets/pause.png';
	} else {
		document.getElementById('play-pauseImg').src = 'assets/play.png';
	}
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
}

function showPrevImage() {
	if (isSoundEnabled) {
		document.getElementById('play-pauseImg').src = 'assets/pause.png';
	} else {
		document.getElementById('play-pauseImg').src = 'assets/play.png';
	}
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
}

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

function updateImage() {
    imgElement.src = images[currentIndex].src;
    commentElement.textContent = images[currentIndex].comment;
    audioElement.src = images[currentIndex].audio;
    if (isSoundEnabled) {
    	audioElement.play();
    }
    
    updateDownloadLink();
    draw();
}

function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',255, 255)';
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
    }
}

function togglePlayPause() {
    if (audioElement.paused) {
        audioElement.play();
        document.getElementById('play-pauseImg').src = 'assets/pause.png';
        isSoundEnabled = true;
    } else {
        audioElement.pause();
        document.getElementById('play-pauseImg').src = 'assets/play.png';
        isSoundEnabled = false;
    }
}

function seekAudio() {
    const seekBar = document.getElementById('seek-bar');
    const time = audioElement.duration * (seekBar.value / 100);
    audioElement.currentTime = time;
}

function updateSeekBar() {
    const seekBar = document.getElementById('seek-bar');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    seekBar.value = (audioElement.currentTime / audioElement.duration) * 100;
    currentTime.textContent = formatTime(audioElement.currentTime);
    duration.textContent = formatTime(audioElement.duration);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updateDownloadLink() {
    const downloadLink = document.getElementById('download');
    downloadLink.href = images[currentIndex].audio;
    downloadLink.download = images[currentIndex].audio.split('/').pop();
}

function downloadTrack() {
    const downloadLink = document.createElement('a');
    downloadLink.href = images[currentIndex].audio;
    downloadLink.download = images[currentIndex].audio.split('/').pop();
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

updateImage();
