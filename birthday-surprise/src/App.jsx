import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const audioRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [blown, setBlown] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const startExperience = async () => {
    setStarted(true);

    try {
      await audioRef.current.play();
      audioRef.current.volume = 0; // start silent
      fadeInAudio();
      startMicDetection();
    } catch (err) {
      console.log("Autoplay blocked:", err);
    }
  };

  const fadeInAudio = () => {
    let vol = 0;
    const interval = setInterval(() => {
      if (vol < 0.5) {
        vol += 0.03;
        audioRef.current.volume = vol;
      } else {
        clearInterval(interval);
      }
    }, 30);
  };

  const startMicDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      const detectBlow = () => {
        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const value = (dataArray[i] - 128) / 128;
          sum += value * value;
        }

        const rms = Math.sqrt(sum / dataArray.length);

        // 🔥 Adjust sensitivity here
        if (rms > 0.15 && !blown) {
          setBlown(true);
          setConfetti(true);
          audioRef.current.volume = 0.2; // soften music after blow
        }

        requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  return (
    <div className="container">
      {!started && (
        <button className="start-btn" onClick={startExperience}>
          Click for Your Surprise ❤️
        </button>
      )}

      <audio ref={audioRef} src="/happy-birthday.mp3" loop />

      {started && (
        <>
          {/* Floating hearts */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="heart"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${50 + Math.random() * 400}px`, // random vertical start
                animationDuration: `${3 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            ></div>
          ))}

          <h1>Happy Birthday Andrei! </h1>

          <div className="cake">
            {/* Candle */}
            <div className="candle">
              <div className={`flame ${blown ? "out" : ""}`}></div>
            </div>

            {/* Top Layer */}
            <div className="layer top"></div>

            {/* Icing Drip */}
            <div className="icing">
              <span></span>
              <span></span>
              <span></span>
            </div>

            {/* Bottom Layer */}
            <div className="layer bottom"></div>
          </div>

          <div className="cake-gif">
            <img src="/cat.gif" alt="Celebration gif" />
          </div>

          {/* Confetti */}
          {confetti && (
            <div className="confetti-container">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{ "--i": Math.random() }}
                ></div>
              ))}
            </div>
          )}

          {blown && (
            <div className="overlay">
              <div className="popup">
                <button className="close-btn" onClick={() => setBlown(false)}>
                  ✖
                </button>

                <div className="popup-content">
                  <div className="left">
                    <h2>My Message For You ❤️</h2>
                    <p>
                      Happiest Birthday Pookie! Always remember that I love and appreciate you.
                      Thank you for loving me endlessly as I will love you the same. 
                    </p>
                  </div>

                  <div className="right">
                    <img src="/img.jpg" alt="Us" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
