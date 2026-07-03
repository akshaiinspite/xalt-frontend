import './PendulumLamp.css';

const PendulumLamp = () => {
  return (
    <div className="pendulum-container">
      <div className="pendulum-wrapper">
        <div className="pendulum-wire"></div>
        <div className="pendulum-lamp-head">
          <svg width="200" height="120" viewBox="0 0 200 120" style={{ overflow: 'visible', position: 'relative', zIndex: 4 }}>
            <defs>
              <radialGradient id="shadeGrad" cx="35%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#4a4a50" />
                <stop offset="50%" stopColor="#222226" />
                <stop offset="100%" stopColor="#08080a" />
              </radialGradient>
              <radialGradient id="insideGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a1a1c" />
                <stop offset="100%" stopColor="#020202" />
              </radialGradient>
            </defs>
            
            {/* Main Bell Shape with perfectly smooth tangent-matched dome and flared sides */}
            <path d="M 10 95
                     C 10 122, 190 122, 190 95
                     L 150 40
                     C 110 -15, 90 -15, 50 40
                     Z" 
                  fill="url(#shadeGrad)" />
                  
            {/* Dark Interior Opening (matching the 3D perspective of the bottom curve) */}
            <ellipse cx="100" cy="95" rx="90" ry="20" fill="url(#insideGrad)" />
          </svg>
          <div className="pendulum-bulb"></div>
        </div>
        <div className="pendulum-rays"></div>
      </div>
    </div>
  );
};

export default PendulumLamp;
