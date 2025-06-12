import React, { useState, useRef, useEffect, useReducer, useCallback } from 'react';
// We don't import App.css here because it's imported in main.jsx

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

// This data is now handled in App.css, but we keep it here for theme logic
const THEMES = [
    { name: 'Terminal', class: 'theme-terminal' },
    { name: 'Amber', class: 'theme-amber' },
    { name: 'Arctic', class: 'theme-arctic' },
    { name: 'Vaporwave', class: 'theme-vaporwave' }
];


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
                    src="src/1730826965556.jpeg"
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

    useEffect(() => {
        document.body.className = THEMES[themeIndex].class;
    }, [themeIndex]);

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
            {/* The GlobalStyles component is no longer needed here as styles are in App.css */}
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












