class FocusApp {
    constructor() {
        this.timer = 0;
        this.isRunning = false;
        this.interval = null;
        this.focusTime = 0;
        this.totalTime = 0;
        this.isFollowing = false;
        this.followStartTime = 0;
        this.accuracy = 0;
        this.musicPlaying = false;
        this.cameraActive = false;
        this.eyeTracking = false;
        this.eyePosition = { x: 0, y: 0 };
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupDotTracking();
        this.setupEyeTracking();
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.musicBtn = document.getElementById('musicBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        this.focusDot = document.getElementById('focusDot');
        this.focusTimeDisplay = document.getElementById('focusTime');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.appContainer = document.querySelector('.app-container');
        this.cameraBtn = document.getElementById('cameraBtn');
        this.cameraStatus = document.getElementById('cameraStatus');
        this.cameraVideo = document.getElementById('cameraVideo');
        this.cameraCanvas = document.getElementById('cameraCanvas');
        this.cameraContainer = document.getElementById('cameraContainer');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.musicBtn.addEventListener('click', () => this.toggleMusic());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.cameraBtn.addEventListener('click', () => this.toggleCamera());
        
        // Prevent context menu on long press for mobile
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setupDotTracking() {
        // Track mouse/touch movement relative to the dot
        let isTracking = false;
        
        const startTracking = (e) => {
            isTracking = true;
            this.startFollowing();
        };
        
        const stopTracking = () => {
            isTracking = false;
            this.stopFollowing();
        };
        
        const trackMovement = (e) => {
            if (!isTracking) return;
            
            const rect = this.focusDot.getBoundingClientRect();
            const dotCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const distance = Math.sqrt(
                Math.pow(clientX - dotCenter.x, 2) + Math.pow(clientY - dotCenter.y, 2)
            );
            
            // Consider following if within 50px of the dot
            const isNearDot = distance < 50;
            
            if (isNearDot && !this.isFollowing) {
                this.startFollowing();
            } else if (!isNearDot && this.isFollowing) {
                this.stopFollowing();
            }
        };
        
        // Mouse events
        document.addEventListener('mousedown', startTracking);
        document.addEventListener('mouseup', stopTracking);
        document.addEventListener('mousemove', trackMovement);
        
        // Touch events
        document.addEventListener('touchstart', startTracking);
        document.addEventListener('touchend', stopTracking);
        document.addEventListener('touchmove', trackMovement);
        
        // Prevent scrolling on mobile
        document.addEventListener('touchmove', (e) => {
            if (isTracking) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    startFollowing() {
        if (!this.isFollowing) {
            this.isFollowing = true;
            this.followStartTime = Date.now();
            this.focusDot.classList.add('following');
        }
    }
    
    stopFollowing() {
        if (this.isFollowing) {
            this.isFollowing = false;
            const followDuration = Date.now() - this.followStartTime;
            this.focusTime += followDuration;
            this.focusDot.classList.remove('following');
            this.updateStats();
        }
    }
    
    updateStats() {
        if (this.totalTime > 0) {
            this.accuracy = Math.round((this.focusTime / this.totalTime) * 100);
        }
        
        this.focusTimeDisplay.textContent = this.formatTime(this.focusTime);
        this.accuracyDisplay.textContent = `${this.accuracy}%`;
    }
    
    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.appContainer.classList.add('focus-mode');
            
            this.interval = setInterval(() => {
                this.timer += 1000;
                this.totalTime += 1000;
                this.updateTimerDisplay();
                this.updateStats();
            }, 1000);
        }
    }
    
    stopTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.appContainer.classList.remove('focus-mode');
            
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
            
            // Stop following when timer stops
            if (this.isFollowing) {
                this.stopFollowing();
            }
        }
    }
    
    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        this.focusTime = 0;
        this.totalTime = 0;
        this.accuracy = 0;
        this.updateTimerDisplay();
        this.updateStats();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60000);
        const seconds = Math.floor((this.timer % 60000) / 1000);
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    }
    
    toggleMusic() {
        if (this.musicPlaying) {
            this.stopAmbientMusic();
            this.musicBtn.textContent = '🎵 Play Music';
            this.musicPlaying = false;
        } else {
            this.startAmbientMusic();
            this.musicBtn.textContent = '🔇 Stop Music';
            this.musicPlaying = true;
        }
    }
    
    startAmbientMusic() {
        try {
            // Try to play the background music file first
            this.backgroundMusic.volume = this.volumeSlider.value / 100;
            this.backgroundMusic.play().catch(e => {
                console.log('Audio file not found, using generated ambient music');
                this.createAmbientMusic();
            });
        } catch (e) {
            console.log('Audio not supported, using generated ambient music');
            this.createAmbientMusic();
        }
    }
    
    stopAmbientMusic() {
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        if (this.ambientSound) {
            this.ambientSound.stop();
        }
    }
    
    createAmbientMusic() {
        if (!this.ambientSound) {
            this.ambientSound = new AmbientSound();
            this.ambientSound.init();
        }
        this.ambientSound.start();
    }
    
    setVolume(value) {
        const volume = value / 100;
        this.backgroundMusic.volume = volume;
        if (this.ambientSound) {
            this.ambientSound.setVolume(volume);
        }
    }
    
    setupEyeTracking() {
        // Simple eye tracking using face detection
        this.faceDetector = null;
        this.eyeTrackingInterval = null;
    }
    
    async toggleCamera() {
        if (this.cameraActive) {
            this.stopCamera();
        } else {
            await this.startCamera();
        }
    }
    
    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 320, 
                    height: 240,
                    facingMode: 'user'
                } 
            });
            
            this.cameraVideo.srcObject = stream;
            this.cameraActive = true;
            this.cameraStatus.textContent = 'Camera: On';
            this.cameraBtn.textContent = '📷 Disable Eye Tracking';
            this.cameraContainer.style.display = 'block';
            
            // Start eye tracking when video is ready
            this.cameraVideo.onloadedmetadata = () => {
                this.startEyeTracking();
            };
            
        } catch (error) {
            console.error('Camera access denied:', error);
            this.cameraStatus.textContent = 'Camera: Access Denied';
            alert('Camera access is required for eye tracking. Please allow camera access and try again.');
        }
    }
    
    stopCamera() {
        if (this.cameraVideo.srcObject) {
            this.cameraVideo.srcObject.getTracks().forEach(track => track.stop());
            this.cameraVideo.srcObject = null;
        }
        
        this.cameraActive = false;
        this.eyeTracking = false;
        this.cameraStatus.textContent = 'Camera: Off';
        this.cameraBtn.textContent = '📷 Enable Eye Tracking';
        this.cameraContainer.style.display = 'none';
        
        if (this.eyeTrackingInterval) {
            clearInterval(this.eyeTrackingInterval);
            this.eyeTrackingInterval = null;
        }
    }
    
    startEyeTracking() {
        this.eyeTracking = true;
        this.eyeTrackingInterval = setInterval(() => {
            this.detectEyePosition();
        }, 100); // Check every 100ms
    }
    
    detectEyePosition() {
        if (!this.cameraActive || !this.eyeTracking) return;
        
        const canvas = this.cameraCanvas;
        const ctx = canvas.getContext('2d');
        const video = this.cameraVideo;
        
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Simple eye detection using image data analysis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const eyePosition = this.findEyePosition(imageData, canvas.width, canvas.height);
        
        if (eyePosition) {
            this.eyePosition = eyePosition;
            this.checkEyeFocus();
        }
    }
    
    findEyePosition(imageData, width, height) {
        // Simple eye detection algorithm
        // Look for dark regions (pupils) in the upper half of the face
        const data = imageData.data;
        const centerX = width / 2;
        const centerY = height / 3; // Upper third of the image
        const searchRadius = Math.min(width, height) / 4;
        
        let darkestX = centerX;
        let darkestY = centerY;
        let darkestValue = 255;
        
        // Search in a circular area around the center
        for (let y = centerY - searchRadius; y < centerY + searchRadius; y += 2) {
            for (let x = centerX - searchRadius; x < centerX + searchRadius; x += 2) {
                if (x < 0 || x >= width || y < 0 || y >= height) continue;
                
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                if (distance > searchRadius) continue;
                
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const brightness = (r + g + b) / 3;
                
                if (brightness < darkestValue) {
                    darkestValue = brightness;
                    darkestX = x;
                    darkestY = y;
                }
            }
        }
        
        // Convert to screen coordinates (approximate)
        const screenX = (darkestX / width) * window.innerWidth;
        const screenY = (darkestY / height) * window.innerHeight;
        
        return { x: screenX, y: screenY };
    }
    
    checkEyeFocus() {
        if (!this.eyeTracking) return;
        
        const dotRect = this.focusDot.getBoundingClientRect();
        const dotCenter = {
            x: dotRect.left + dotRect.width / 2,
            y: dotRect.top + dotRect.height / 2
        };
        
        const distance = Math.sqrt(
            Math.pow(this.eyePosition.x - dotCenter.x, 2) + 
            Math.pow(this.eyePosition.y - dotCenter.y, 2)
        );
        
        // Consider focusing if within 100px of the dot (eye tracking is less precise)
        const isNearDot = distance < 100;
        
        if (isNearDot && !this.isFollowing) {
            this.startFollowing();
        } else if (!isNearDot && this.isFollowing) {
            this.stopFollowing();
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FocusApp();
});

// Add some ambient sound generation for better focus
class AmbientSound {
    constructor() {
        this.audioContext = null;
        this.oscillators = [];
        this.isPlaying = false;
        this.volume = 0.1;
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    start() {
        if (!this.audioContext || this.isPlaying) return;
        
        this.isPlaying = true;
        
        // Create multiple sine waves for ambient space music
        const frequencies = [220, 330, 440, 554]; // A3, E4, A4, C#5
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            // Very low volume for ambient effect
            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            
            // Add slight frequency modulation for natural sound
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            lfo.frequency.setValueAtTime(0.05 + index * 0.02, this.audioContext.currentTime);
            lfo.type = 'sine';
            lfoGain.gain.setValueAtTime(1 + index * 0.5, this.audioContext.currentTime);
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            oscillator.start();
            lfo.start();
            
            this.oscillators.push({ oscillator, lfo, gainNode });
        });
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.oscillators.forEach(({ oscillator, lfo }) => {
            try {
                oscillator.stop();
                lfo.stop();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        this.oscillators = [];
    }
    
    setVolume(volume) {
        this.volume = volume;
        if (this.isPlaying) {
            this.oscillators.forEach(({ gainNode }) => {
                gainNode.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
            });
        }
    }
}

// Initialize ambient sound
const ambientSound = new AmbientSound();
document.addEventListener('DOMContentLoaded', () => {
    ambientSound.init();
});
