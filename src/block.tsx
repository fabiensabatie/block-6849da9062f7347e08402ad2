import React, { useState, useCallback, useEffect } from 'react';

interface BlockProps {
  title?: string;
  keyCount?: number;
}

interface PianoKey {
  note: string;
  frequency: number;
  isBlack: boolean;
  keyCode?: string;
}

const Block: React.FC<BlockProps> = ({ title = "Interactive Piano", keyCount = 16 }) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Define piano keys with frequencies (starting from C4)
  const pianoKeys: PianoKey[] = [
    { note: 'C4', frequency: 261.63, isBlack: false, keyCode: 'a' },
    { note: 'C#4', frequency: 277.18, isBlack: true, keyCode: 'w' },
    { note: 'D4', frequency: 293.66, isBlack: false, keyCode: 's' },
    { note: 'D#4', frequency: 311.13, isBlack: true, keyCode: 'e' },
    { note: 'E4', frequency: 329.63, isBlack: false, keyCode: 'd' },
    { note: 'F4', frequency: 349.23, isBlack: false, keyCode: 'f' },
    { note: 'F#4', frequency: 369.99, isBlack: true, keyCode: 't' },
    { note: 'G4', frequency: 392.00, isBlack: false, keyCode: 'g' },
    { note: 'G#4', frequency: 415.30, isBlack: true, keyCode: 'y' },
    { note: 'A4', frequency: 440.00, isBlack: false, keyCode: 'h' },
    { note: 'A#4', frequency: 466.16, isBlack: true, keyCode: 'u' },
    { note: 'B4', frequency: 493.88, isBlack: false, keyCode: 'j' },
    { note: 'C5', frequency: 523.25, isBlack: false, keyCode: 'k' },
    { note: 'C#5', frequency: 554.37, isBlack: true, keyCode: 'o' },
    { note: 'D5', frequency: 587.33, isBlack: false, keyCode: 'l' },
    { note: 'D#5', frequency: 622.25, isBlack: true, keyCode: 'p' },
  ];

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      }
    };

    // Initialize on first user interaction
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [audioContext]);

  // Play sound function
  const playSound = useCallback((frequency: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [audioContext]);

  // Handle key press
  const handleKeyPress = useCallback((key: PianoKey) => {
    setActiveKeys(prev => new Set(prev).add(key.note));
    playSound(key.frequency);
    
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key.note);
        return newSet;
      });
    }, 150);
  }, [playSound]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = pianoKeys.find(k => k.keyCode === event.key.toLowerCase());
      if (key && !activeKeys.has(key.note)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, activeKeys, pianoKeys]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        color: 'white',
        marginBottom: '2rem',
        fontSize: '2.5rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        {title}
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <p style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
          Click the keys or use your keyboard to play!
        </p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', textAlign: 'center' }}>
          Keys: A-S-D-F-G-H-J-K-L (white keys) | W-E-T-Y-U-O-P (black keys)
        </p>
      </div>

      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        background: '#2c3e50',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        border: '4px solid #34495e'
      }}>
        {/* White keys */}
        {pianoKeys.filter(key => !key.isBlack).map((key, index) => (
          <button
            key={key.note}
            onMouseDown={() => handleKeyPress(key)}
            style={{
              width: '60px',
              height: '200px',
              backgroundColor: activeKeys.has(key.note) ? '#f0f0f0' : 'white',
              border: '2px solid #ddd',
              borderRadius: '0 0 8px 8px',
              margin: '0 1px',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              boxShadow: activeKeys.has(key.note) 
                ? 'inset 0 4px 8px rgba(0,0,0,0.2)' 
                : '0 4px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '1rem',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#666',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!activeKeys.has(key.note)) {
                e.currentTarget.style.backgroundColor = '#f8f8f8';
              }
            }}
            onMouseLeave={(e) => {
              if (!activeKeys.has(key.note)) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            {key.note.replace(/[0-9]/g, '')}
          </button>
        ))}

        {/* Black keys */}
        {pianoKeys.filter(key => key.isBlack).map((key, index) => {
          // Calculate position based on white key pattern
          const whiteKeysBefore = pianoKeys.filter((k, i) => 
            i < pianoKeys.indexOf(key) && !k.isBlack
          ).length;
          
          let leftOffset = whiteKeysBefore * 62 - 30; // 60px width + 2px margin - 30px to center
          
          return (
            <button
              key={key.note}
              onMouseDown={() => handleKeyPress(key)}
              style={{
                position: 'absolute',
                left: `${leftOffset}px`,
                top: '2rem',
                width: '40px',
                height: '120px',
                backgroundColor: activeKeys.has(key.note) ? '#333' : '#1a1a1a',
                border: '2px solid #000',
                borderRadius: '0 0 4px 4px',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                boxShadow: activeKeys.has(key.note) 
                  ? 'inset 0 2px 4px rgba(0,0,0,0.5)' 
                  : '0 2px 4px rgba(0,0,0,0.3)',
                zIndex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '0.5rem',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!activeKeys.has(key.note)) {
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                }
              }}
              onMouseLeave={(e) => {
                if (!activeKeys.has(key.note)) {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                }
              }}
            >
              {key.note.replace(/[0-9]/g, '')}
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>How to Play:</h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          fontSize: '0.9rem'
        }}>
          <li>🖱️ Click any key to play a note</li>
          <li>⌨️ Use keyboard shortcuts for quick playing</li>
          <li>🎵 White keys: A, S, D, F, G, H, J, K, L</li>
          <li>🎹 Black keys: W, E, T, Y, U, O, P</li>
        </ul>
      </div>
    </div>
  );
};

export default Block;