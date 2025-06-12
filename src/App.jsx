import React, { useState, useRef, useEffect, useReducer, useCallback } from 'react';

// --- Data ---
const YOUTUBE_STREAMS = [
    { name: 'Lofi Girl', id: 'jfKfPfyJRdk' },
    { name: 'Tokyo Lofi', id: 'rPjez8z61rI' },
    { name: 'Rainy Day', id: 'vYIYIVmOo3Q' },
    { name: 'Synthwave', id: '28KRPhVzCus' },
    { name: 'Chillhop Raccoon', id: '6Jsnem7i848'},
    { name: 'Coffee Shop', id: '4xDzrJKXOOY' }
];

const SCENES = [
    { background: "https://i.pinimg.com/originals/a3/c7/35/a3c7357e33061a3fc4f43fdd2622cbfb.gif", foreground: null },
    { background: "https://i.pinimg.com/originals/34/a4/31/34a431403ca0b12489a55f327817fc63.gif", foreground: null },
    { background: "https://i.pinimg.com/originals/69/e0/13/69e01301bf2ae2846ea70e073a3d1286.gif", foreground: null },
    { background: "https://i.pinimg.com/originals/d9/d5/43/d9d54343362d2a9d3edf84b80c3fd549.gif", foreground: null },
    { background: "https://i.pinimg.com/originals/88/42/4b/88424bd280cdbec92a8c025ae5bbd852.gif", foreground: null },
    { background: "https://i.pinimg.com/originals/48/6d/71/486d712057eea11871314c6485f56894.gif", foreground: null }
];

const THEMES = [
    {
        name: 'Terminal',
        '--bg-dark': '#0A0F0D',
        '--text-primary': '#39FF14',
        '--text-secondary': '#2ECC71',
        '--accent-amber': '#FFBF00',
        '--border-color': '#1E8449'
    },
    {
        name: 'Amber',
        '--bg-dark': '#1a1000',
        '--text-primary': '#FFBF00',
        '--text-secondary': '#D4A000',
        '--accent-amber': '#FFFFFF',
        '--border-color': '#D4A000'
    },
    {
        name: 'Arctic',
        '--bg-dark': '#0d1a26',
        '--text-primary': '#a8d5ff',
        '--text-secondary': '#6a8aab',
        '--accent-amber': '#ff8a8a',
        '--border-color': '#6a8aab'
    },
    {
        name: 'Vaporwave',
        '--bg-dark': '#1a0d26',
        '--text-primary': '#ff79c6',
        '--text-secondary': '#bd93f9',
        '--accent-amber': '#50fa7b',
        '--border-color': '#bd93f9'
    }
];


// --- CSS (as a Component) ---
const GlobalStyles = ({ theme }) => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        :root {
            --bg-dark: ${theme['--bg-dark']};
            --text-primary: ${theme['--text-primary']};
            --text-secondary: ${theme['--text-secondary']};
            --accent-amber: ${theme['--accent-amber']};
            --border-color: ${theme['--border-color']};
            --font-family: 'VT323', monospace;
            --ui-bg-color: rgba(10, 20, 15, 0.8);
        }
        body {
            font-family: var(--font-family);
            background-color: var(--bg-dark);
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            overflow: hidden;
            letter-spacing: 0.075em;
            text-shadow: 0 0 5px var(--text-primary);
        }
        button, .icon-link {
            font-family: var(--font-family);
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            padding: 0;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s ease, text-shadow 0.2s ease;
        }
        button:hover, .icon-link:hover {
            text-shadow: 0 0 8px var(--accent-amber);
            color: var(--accent-amber);
        }
        button:disabled {
            color: var(--text-secondary) !important;
            cursor: not-allowed;
            text-shadow: none !important;
        }

        /* --- New Startup & Click to Start --- */
        .start-screen {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background-color: #000;
            z-index: 200;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: opacity 0.5s ease;
            text-align: center;
        }
         .start-screen.hidden {
            opacity: 0;
            pointer-events: none;
         }
        .start-screen h1 {
            font-size: 3rem;
            margin: 0;
            text-shadow: 0 0 8px var(--text-primary);
        }
        .start-screen p {
            font-size: 1.5rem;
            animation: blink 2s steps(1, end) infinite;
        }

        .startup-container {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background-color: #000; z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            box-sizing: border-box;
            opacity: 1;
            animation: fade-out-startup 1.5s 5s forwards;
            pointer-events: none;
        }
        .boot-sequence > p {
            margin: 0;
            line-height: 1.6;
        }
        .blinking-cursor {
            width: 0.8em;
            height: 1.5em;
            background: var(--text-primary);
            display: inline-block;
            vertical-align: middle;
            animation: blink 1s steps(1, end) infinite;
        }
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
        }
        @keyframes fade-out-startup {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .app-container { position: relative; width: 100vw; height: 100vh; }
        .background-visual-container, .crt-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: -2; pointer-events: none;
        }
        .visual-layer {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover; transition: opacity 1.5s ease-in-out;
            filter: brightness(0.8) contrast(1.1);
        }
        .visual-layer.foreground.animated { animation: subtle-drift 45s linear infinite alternate; }
        @keyframes subtle-drift {
            from { transform: translateX(-1%); }
            to { transform: translateX(1%); }
        }
        .crt-overlay {
             background: repeating-linear-gradient(0deg, rgba(10, 15, 13, 0.2), rgba(10, 15, 13, 0.2) 1px, transparent 1px, transparent 3px);
             z-index: 20;
        }
        #youtube-player-container {
            position: fixed; top: -9999px; left: -9999px; z-index: 5;
            transition: all 0.5s ease;
        }
        #youtube-player-container.visible {
            top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 80vw; height: calc(80vw * 9 / 16); max-width: 1280px; max-height: 720px;
            border: 4px solid var(--text-primary); box-shadow: 0 0 25px var(--text-primary);
        }
        .top-left-panel, .right-panel, .bottom-left-panel, .bottom-track-info, .bottom-right-panels {
            z-index: 15; transition: opacity 0.5s ease-in-out;
        }
        .top-left-panel { position: fixed; top: 2rem; left: 2rem; font-size: 1.4rem; }
        .copied-message { color: var(--accent-amber); }
        .right-panel { position: fixed; top: 2rem; right: 2rem; text-align: right; font-size: 1.2rem; }
        .icon-bar { display: flex; gap: 0.75rem; justify-content: flex-end; margin-bottom: 1.5rem; align-items: center; }
        .icon-bar .icon-link, .icon-bar button {
            color: var(--text-primary);
            font-size: 1.75rem;
            width: 32px;
            height: 32px;
        }
        .profile-photo-square {
            width: 50px; height: 50px; border: 2px solid var(--border-color);
            margin-bottom: 1.5rem; margin-left: auto; object-fit: cover;
            background-color: var(--text-secondary); border-radius: 4px;
        }
        .shortcuts-list span { color: var(--text-secondary); }
        .shortcuts-list div { margin-bottom: 0.5rem; }
        .settings-options { margin-top: 1.5rem; }
        .settings-options label {
            display: flex; align-items: center; justify-content: flex-end;
            gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;
        }
        .settings-options input[type="email"] {
            background: var(--bg-dark); border: 1px solid var(--border-color); color: var(--text-primary);
            font-family: var(--font-family); padding: 0.25rem; width: 150px;
        }
        .settings-options .email-button { color: var(--text-primary); }
        .settings-options a { color: var(--text-primary); text-decoration: none; }
        .support-link {
            display: inline-block; margin-top: 1rem; padding: 0.25rem 0.5rem;
            border: 1px solid var(--border-color);
        }
        .bottom-left-panel { position: fixed; bottom: 2rem; left: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .player-controls { display: flex; align-items: center; gap: 1rem; font-size: 1.5rem; }
        .player-controls button { padding: 4px; }
        .volume-bar { 
            display: flex; gap: 2px; margin-left: 1rem; cursor: pointer; padding: 0.25rem;
        }
        .volume-segment { width: 5px; height: 16px; background-color: var(--text-secondary); }
        .volume-segment.active { background-color: var(--text-primary); box-shadow: 0 0 5px var(--text-primary); }
        
        .bottom-track-info {
            font-size: 1.4rem; white-space: nowrap; display: flex; align-items: center;
        }

        .visualizer {
            display: flex; align-items: flex-end; gap: 2px; height: 20px; margin-left: 1.5rem;
        }
        .visualizer-bar { width: 5px; background-color: var(--text-primary); }
        .visualizer.playing .visualizer-bar:nth-child(1) { animation: beat 0.6s infinite alternate; }
        .visualizer.playing .visualizer-bar:nth-child(2) { animation: beat 0.8s infinite alternate-reverse; }
        .visualizer.playing .visualizer-bar:nth-child(3) { animation: beat 0.7s infinite alternate; }
        .visualizer.playing .visualizer-bar:nth-child(4) { animation: beat 0.5s infinite alternate-reverse; }
        .visualizer.playing .visualizer-bar:nth-child(5) { animation: beat 0.9s infinite alternate; }
        @keyframes beat { from { height: 2px; } to { height: 20px; } }
        
        .bottom-right-panels {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            display: flex;
            align-items: flex-end;
            gap: 1rem;
            flex-wrap: wrap-reverse;
            justify-content: flex-end;
        }
        
        .todo-panel, .pomodoro-panel {
            background-color: var(--ui-bg-color);
            border: 1px solid var(--border-color); border-top: 4px solid var(--accent-amber);
            padding: 1rem; text-align: left;
            background-image: linear-gradient(rgba(0,255,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.05) 1px, transparent 1px);
            background-size: 20px 20px;
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .todo-panel.hidden, .pomodoro-panel.hidden {
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
        }
        .todo-panel { width: 280px; }
        .pomodoro-panel { width: 220px; text-align: center; }

        .panel-title {
            font-size: 1.4rem; text-align: center; color: var(--accent-amber);
            margin-top: 0; margin-bottom: 1rem;
        }
        .task-input-area { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .task-input-area input {
            flex-grow: 1; background: var(--bg-dark); border: 1px solid var(--border-color);
            color: var(--text-primary); font-family: var(--font-family); padding: 0.25rem;
        }
        .task-input-area button { color: var(--text-primary); }
        #task-list { list-style-type: none; padding: 0; max-height: 150px; overflow-y: auto; }
        #task-list li {
            display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;
        }
        #task-list .remove-task-btn {
            color: var(--text-primary); font-size: 1.1rem; padding-left: 0.5rem;
        }
        .pomodoro-time {
            font-size: 3.5rem;
            margin: 0.5rem 0;
        }
        .pomodoro-controls {
            display: flex;
            justify-content: center;
            gap: 1rem;
        }
        .pomodoro-controls button {
            font-size: 1.2rem;
            padding: 0.25rem 0.75rem;
            border: 1px solid var(--border-color);
        }
    `}</style>
);

// --- State Management ---
const initialState = {
    player: null, isPlaying: false, streamIndex: 0, volume: 0.5, themeIndex: 0,
    isYouTubeVisible: false, shortcutsEnabled: true, isLowPower: false,
    showCopiedMessage: false, isRightPanelDetailsVisible: true, 
    appStarted: false, isAnimationComplete: false, audioContext: null, isFullscreen: false,
    isPomodoroVisible: true,
};

function appReducer(state, action) {
    switch (action.type) {
        case 'APP_START': return { ...state, appStarted: true };
        case 'SET_PLAYER': return { ...state, player: action.payload };
        case 'SET_IS_PLAYING': return { ...state, isPlaying: action.payload };
        case 'SET_STREAM_INDEX': return { ...state, streamIndex: action.payload };
        case 'SET_VOLUME': return { ...state, volume: action.payload };
        case 'CYCLE_THEME': return { ...state, themeIndex: (state.themeIndex + 1) % THEMES.length };
        case 'TOGGLE_YOUTUBE_VISIBILITY': return { ...state, isYouTubeVisible: !state.isYouTubeVisible };
        case 'TOGGLE_SHORTCUTS': return { ...state, shortcutsEnabled: !state.shortcutsEnabled };
        case 'TOGGLE_LOW_POWER': return { ...state, isLowPower: !state.isLowPower };
        case 'SHOW_COPIED_MESSAGE': return { ...state, showCopiedMessage: action.payload };
        case 'TOGGLE_RIGHT_PANEL_DETAILS': return { ...state, isRightPanelDetailsVisible: !state.isRightPanelDetailsVisible };
        case 'TOGGLE_POMODORO': return { ...state, isPomodoroVisible: !state.isPomodoroVisible };
        case 'SET_ANIMATION_COMPLETE': return { ...state, isAnimationComplete: true };
        case 'INIT_AUDIO_CONTEXT': return { ...state, audioContext: action.payload };
        case 'SET_FULLSCREEN': return { ...state, isFullscreen: action.payload };
        default: return state;
    }
}

// --- Audio Engine ---
const playSound = (audioContext, type, freq, duration, volume = 0.1) => {
    if (!audioContext || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
};

const playGlitchSound = (audioContext) => {
    if (!audioContext || audioContext.state !== 'running') return;
    const bufferSize = audioContext.sampleRate * 0.2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
};


// --- Components ---
const StartScreen = ({ onClick }) => (
    <div className="start-screen" onClick={onClick}>
        <h1>Lofi OS</h1>
        <p>Click to Start</p>
    </div>
);

const StartupAnimation = ({ audioContext }) => {
    const bootLines = ["BOOTING LOFI-OS V2.0...","MEMORY CHECK: 128KB OK","LOADING AUDIO MODULES...","CONNECTING TO STATION...","READY."];
    const [visibleLines, setVisibleLines] = useState([]);

    useEffect(() => {
        let timeout;
        bootLines.forEach((line, index) => {
            timeout = setTimeout(() => {
                setVisibleLines(prev => [...prev, line]);
                if (index === bootLines.length - 1) {
                    playSound(audioContext, 'sine', 980, 0.3);
                } else {
                    playSound(audioContext, 'square', 1800, 0.03, 0.05);
                }
            }, 800 * (index + 1));
        });
        return () => clearTimeout(timeout);
    }, [audioContext]);

    return (
        <div className="startup-container">
            <div className="boot-sequence">
                {visibleLines.map((line, i) => <p key={i}>{line}</p>)}
                <span className="blinking-cursor"></span>
            </div>
        </div>
    );
};

const Visuals = ({ scene, isLowPower }) => (
    <div className="background-visual-container">
        {scene.background && <img src={scene.background} alt="Background" className="visual-layer" />}
        {scene.foreground && <img src={scene.foreground} alt="Foreground" className={`visual-layer foreground ${isLowPower ? '' : 'animated'}`} />}
    </div>
);

const TopLeftPanel = ({ streamIndex, totalStreams, showCopiedMessage }) => (
    <div className="top-left-panel">
        {showCopiedMessage ? <span className="copied-message">Link copied!</span> : `STATION ${streamIndex + 1}/${totalStreams}`}
    </div>
);

const RightPanel = ({ onTweet, onShare, shortcutsEnabled, onToggleShortcuts, detailsVisible, onToggleDetails, onCycleTheme, onTogglePomodoro }) => (
    <div className="right-panel">
        <div className="icon-bar">
            <a href="https://github.com/saintcoder0" target="_blank" rel="noopener noreferrer" title="GitHub" className="icon-link">★</a>
            <a href="https://x.com/TUSHARSHARMA_00" target="_blank" rel="noopener noreferrer" title="Twitter" className="icon-link">X</a>
            <button onClick={onCycleTheme} title="Change Theme">🎨</button>
            <button onClick={onTogglePomodoro} title="Toggle Timer">🕒</button>
            <button onClick={onToggleDetails} title="Settings">⚙</button>
        </div>
        {detailsVisible && (
            <>
                <img 
                    src="/1730826965556.jpeg"
                    alt="Profile" 
                    className="profile-photo-square" 
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/50x50/0A0F0D/39FF14?text=PIC"; }}
                />
                <div className="shortcuts-list">
                    <div><span>spacebar</span> play/pause</div>
                    <div><span>arrows</span> change station</div>
                    <div><span>C</span> change theme</div>
                    <div><span>P</span> toggle pomodoro</div>
                    <div><span>T</span> tweet this station</div>
                    <div><span>V</span> show original video</div>
                    <div><span>L</span> low-power mode</div>
                </div>
                <div className="settings-options">
                    <label><input type="checkbox" checked={!shortcutsEnabled} onChange={onToggleShortcuts} /> Disable shortcuts</label>
                    <label><input type="checkbox" defaultChecked /> New stations & updates</label>
                    <label>
                        <input type="email" defaultValue="your-amazing.email" />
                        <button className="email-button" onClick={() => alert('Subscribed!')}>✓</button>
                    </label>
                    <div>or <a href="mailto:contact@example.com">click here to say hi!</a></div>
                    <a href="https://www.buymeacoffee.com/your-page" target="_blank" rel="noopener noreferrer" className="support-link">Support Me</a>
                </div>
            </>
        )}
    </div>
);

const BottomLeftPanel = ({ onPlayPause, isPlaying, onShuffleStream, onNextStream, onVolumeClick, volume, playerReady, onFullscreen, isFullscreen, currentStreamName }) => {
    const totalVolumeSegments = 10;
    const activeSegments = Math.round(volume * totalVolumeSegments);
    return (
        <div className="bottom-left-panel">
            <div className="player-controls">
                <button onClick={onPlayPause} disabled={!playerReady}>{isPlaying ? 'II' : '▶'}</button>
                <button onClick={onShuffleStream} title="Shuffle Station" disabled={!playerReady}>⇄</button>
                <button onClick={onNextStream} disabled={!playerReady}>▶▶</button>
                <div className="volume-bar" onClick={onVolumeClick}>
                    {[...Array(totalVolumeSegments)].map((_, i) => (
                        <div key={i} className={`volume-segment ${i < activeSegments ? 'active' : ''}`}></div>
                    ))}
                </div>
                <button onClick={onFullscreen} title="Toggle Fullscreen">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        {isFullscreen ? (
                             <path d="M2 9H5V11H0V6H2V9ZM2 2V5H0V0H5V2H2ZM11 2V0H16V5H14V2H11ZM14 9V6H16V11H11V9H14Z"/>
                        ) : (
                             <path d="M0 5H3V2H5V0H0V5ZM0 16H5V14H3V11H0V16ZM16 16H11V14H13V11H16V16ZM16 5V0H11V2H13V5H16Z"/>
                        )}
                    </svg>
                </button>
            </div>
             <div className="bottom-track-info">
                {currentStreamName}
                <Visualizer isPlaying={isPlaying} />
            </div>
        </div>
    );
};

const Visualizer = ({ isPlaying }) => (
    <div className={`visualizer ${isPlaying ? 'playing' : ''}`}>
        {[...Array(5)].map((_, i) => <div key={i} className="visualizer-bar"></div>)}
    </div>
);

const TodoList = () => {
    const [tasks, setTasks] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const handleAddTask = () => {
        if (!inputValue.trim()) return;
        setTasks(p => [...p, inputValue.trim()]);
        setInputValue('');
    };
    const handleRemoveTask = (index) => setTasks(p => p.filter((_, i) => i !== index));
    return (
        <div className="todo-panel">
            <h3 className="panel-title">TASKS</h3>
            <ul id="task-list">
                {tasks.map((task, index) => (
                    <li key={index}>
                        <span>{task}</span>
                        <button className="remove-task-btn" onClick={() => handleRemoveTask(index)}>X</button>
                    </li>
                ))}
            </ul>
            <div className="task-input-area">
                <input
                    type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()} placeholder="Add a new task..."
                />
                <button onClick={handleAddTask}>ADD</button>
            </div>
        </div>
    );
};

const PomodoroTimer = ({ audioContext, shortcutsEnabled }) => {
    const [mode, setMode] = useState('work');
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef(null);

    const toggleTimer = useCallback(() => setIsActive(a => !a), []);

    useEffect(() => {
        if (isActive && time > 0) {
            timerRef.current = setInterval(() => {
                setTime(t => t - 1);
            }, 1000);
        } else if (isActive && time === 0) {
            playSound(audioContext, 'triangle', 660, 0.5);
            if (mode === 'work') {
                setMode('break');
                setTime(5 * 60);
            } else {
                setMode('work');
                setTime(25 * 60);
            }
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, time, mode, audioContext]);

    const resetTimer = () => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setMode('work');
        setTime(25 * 60);
    };
    
    useEffect(() => {
        if (!shortcutsEnabled) return;
        const handleKeyDown = (e) => { if (e.key.toLowerCase() === 'p') toggleTimer(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcutsEnabled, toggleTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="pomodoro-panel">
            <h3 className="panel-title">{mode === 'work' ? 'FOCUS' : 'BREAK'}</h3>
            <div className="text-6xl my-2">{formatTime(time)}</div>
            <div className="pomodoro-controls">
                <button onClick={toggleTimer}>{isActive ? 'PAUSE' : 'START'}</button>
                <button onClick={resetTimer}>RESET</button>
            </div>
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const {
        player, isPlaying, streamIndex, volume, themeIndex, isYouTubeVisible,
        shortcutsEnabled, isLowPower, showCopiedMessage, isRightPanelDetailsVisible, appStarted, 
        isAnimationComplete, audioContext, isFullscreen, isPomodoroVisible
    } = state;

    const handleStart = () => {
        dispatch({ type: 'APP_START' });
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        dispatch({ type: 'INIT_AUDIO_CONTEXT', payload: ctx });

        setTimeout(() => dispatch({ type: 'SET_ANIMATION_COMPLETE' }), 6500);
    };
    
    useEffect(() => {
        if (!isAnimationComplete || !appStarted) return;
        
        const onPlayerReady = (event) => dispatch({ type: 'SET_PLAYER', payload: event.target });
        const onPlayerStateChange = (event) => dispatch({ type: 'SET_IS_PLAYING', payload: event.data === window.YT.PlayerState.PLAYING });
        
        const createPlayer = () => {
            return new window.YT.Player('youtube-player-container', { 
                videoId: YOUTUBE_STREAMS[streamIndex].id, 
                events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange }
            });
        };
        
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            window.onYouTubeIframeAPIReady = createPlayer;
            document.head.appendChild(tag);
        } else {
             if (!player) {
                createPlayer();
             } else {
                player.loadVideoById(YOUTUBE_STREAMS[streamIndex].id);
             }
        }
    }, [isAnimationComplete, appStarted, player, streamIndex]);
    
    useEffect(() => {
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(volume * 100);
        }
    }, [volume, player]);

    const handlePlayPause = useCallback(() => {
        if (!player || typeof player.getPlayerState !== 'function') return;
        if (player.getPlayerState() === 1) player.pauseVideo(); else player.playVideo();
    }, [player]);
    
    const handleNextStream = useCallback(() => {
        playGlitchSound(audioContext);
        dispatch({ type: 'SET_STREAM_INDEX', payload: (streamIndex + 1) % YOUTUBE_STREAMS.length });
    }, [audioContext, streamIndex]);
    
    const handleShuffleStream = useCallback(() => {
        playGlitchSound(audioContext);
        let newIndex;
        do { newIndex = Math.floor(Math.random() * YOUTUBE_STREAMS.length); } while (newIndex === streamIndex);
        dispatch({ type: 'SET_STREAM_INDEX', payload: newIndex });
    }, [audioContext, streamIndex]);
    
    const handleVolumeClick = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const newVolume = (e.clientX - rect.left) / rect.width;
        dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(1, newVolume)) });
    }, []);

    const handleTweet = useCallback(() => {
        const text = `Now listening to ${YOUTUBE_STREAMS[streamIndex].name} on Lofi Player!`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    }, [streamIndex]);
    
    const handleShare = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
        dispatch({ type: 'SHOW_COPIED_MESSAGE', payload: true });
        setTimeout(() => dispatch({ type: 'SHOW_COPIED_MESSAGE', payload: false }), 2000);
    }, []);

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    useEffect(() => {
        const onFullscreenChange = () => dispatch({ type: 'SET_FULLSCREEN', payload: !!document.fullscreenElement });
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);
    
    const handleKeyDown = useCallback((e) => {
        if (e.target.tagName === 'INPUT') return;
        const keyActions = {
            ' ': handlePlayPause, 
            'arrowright': handleNextStream,
            'arrowleft': handleShuffleStream,
            't': handleTweet,
            'v': () => dispatch({ type: 'TOGGLE_YOUTUBE_VISIBILITY' }),
            'l': () => dispatch({ type: 'TOGGLE_LOW_POWER' }),
            'c': () => dispatch({ type: 'CYCLE_THEME' }),
            'p': () => dispatch({ type: 'TOGGLE_POMODORO' }),
        };
        const action = keyActions[e.key.toLowerCase()];
        if (action) {
            e.preventDefault();
            action();
        }
    }, [handlePlayPause, handleNextStream, handleShuffleStream, handleTweet]);

    useEffect(() => {
        if (shortcutsEnabled && isAnimationComplete) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcutsEnabled, isAnimationComplete, handleKeyDown]);

    return (
        <>
            <GlobalStyles theme={THEMES[themeIndex]}/>
            {!appStarted && <StartScreen onClick={handleStart} />}
            {appStarted && !isAnimationComplete && <StartupAnimation audioContext={audioContext}/>}
            <div className={`transition-opacity duration-500 ${isAnimationComplete ? 'opacity-100' : 'opacity-0'}`}>
                <Visuals scene={SCENES[streamIndex % SCENES.length]} isLowPower={isLowPower} />
                <div className="crt-overlay"></div>
                <div id="youtube-player-container" className={isYouTubeVisible ? 'visible' : ''}></div>
                <div className="app-container">
                    <TopLeftPanel 
                        streamIndex={streamIndex} 
                        totalStreams={YOUTUBE_STREAMS.length} 
                        showCopiedMessage={showCopiedMessage} 
                    />
                    <RightPanel 
                        onTweet={handleTweet}
                        onShare={handleShare}
                        shortcutsEnabled={shortcutsEnabled}
                        onToggleShortcuts={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })}
                        detailsVisible={isRightPanelDetailsVisible}
                        onToggleDetails={() => dispatch({ type: 'TOGGLE_RIGHT_PANEL_DETAILS' })}
                        onCycleTheme={() => dispatch({ type: 'CYCLE_THEME' })}
                        onTogglePomodoro={() => dispatch({ type: 'TOGGLE_POMODORO' })}
                    />
                    <BottomLeftPanel 
                        onPlayPause={handlePlayPause}
                        isPlaying={isPlaying}
                        onShuffleStream={handleShuffleStream}
                        onNextStream={handleNextStream}
                        onVolumeClick={handleVolumeClick}
                        volume={volume}
                        playerReady={!!player}
                        onFullscreen={handleFullscreen}
                        isFullscreen={isFullscreen}
                        currentStreamName={YOUTUBE_STREAMS[streamIndex].name}
                        isPlayingForVisualizer={isPlaying}
                    />
                    <div className="bottom-right-panels">
                        <div className={isPomodoroVisible ? '' : 'hidden'}><PomodoroTimer audioContext={audioContext} shortcutsEnabled={shortcutsEnabled} /></div>
                        <TodoList />
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;










