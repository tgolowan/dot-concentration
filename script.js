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
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupDotTracking();
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
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.stopBtn.addEventListener('click', () => this.stopTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.musicBtn.addEventListener('click', () => this.toggleMusic());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
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
            this.backgroundMusic.pause();
            this.musicBtn.textContent = '🎵 Play Music';
            this.musicPlaying = false;
        } else {
            this.backgroundMusic.play().catch(e => {
                console.log('Audio play failed:', e);
                // Create a simple tone if audio file is not available
                this.createTone();
            });
            this.musicBtn.textContent = '🔇 Stop Music';
            this.musicPlaying = true;
        }
    }
    
    createTone() {
        // Create a simple calming tone using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
        
        // Loop the tone
        if (this.musicPlaying) {
            setTimeout(() => this.createTone(), 2000);
        }
    }
    
    setVolume(value) {
        const volume = value / 100;
        this.backgroundMusic.volume = volume;
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
        
        // Create multiple sine waves for ambient sound
        const frequencies = [220, 330, 440]; // A3, E4, A4
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            // Very low volume for ambient effect
            gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
            
            // Add slight frequency modulation for natural sound
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            
            lfo.frequency.setValueAtTime(0.1 + index * 0.05, this.audioContext.currentTime);
            lfo.type = 'sine';
            lfoGain.gain.setValueAtTime(2, this.audioContext.currentTime);
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            oscillator.start();
            lfo.start();
            
            this.oscillators.push({ oscillator, lfo });
        });
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        this.oscillators.forEach(({ oscillator, lfo }) => {
            oscillator.stop();
            lfo.stop();
        });
        this.oscillators = [];
    }
}

// Initialize ambient sound
const ambientSound = new AmbientSound();
document.addEventListener('DOMContentLoaded', () => {
    ambientSound.init();
});
