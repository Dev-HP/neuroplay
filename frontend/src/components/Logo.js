import './Logo.css';

function Logo({ size = 'medium', showText = true, animated = true }) {
  const sizes = {
    small: '40px',
    medium: '60px',
    large: '80px',
    xlarge: '120px'
  };

  return (
    <div className={`logo-container ${animated ? 'animated' : ''}`}>
      <svg 
        width={sizes[size]} 
        height={sizes[size]} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#667eea', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#764ba2', stopOpacity:1}} />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#f093fb', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#f5576c', stopOpacity:1}} />
          </linearGradient>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="4" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="100" cy="100" r="90" fill="url(#brainGradient)" opacity="0.1"/>
        
        <g filter="url(#softShadow)">
          <path d="M 70 60 Q 50 70, 50 90 Q 50 110, 60 125 Q 70 135, 85 135 Q 95 135, 100 130" 
                stroke="url(#brainGradient)" strokeWidth="6" fill="none" strokeLinecap="round"/>
          
          <path d="M 130 60 Q 150 70, 150 90 Q 150 110, 140 125 Q 130 135, 115 135 Q 105 135, 100 130" 
                stroke="url(#brainGradient)" strokeWidth="6" fill="none" strokeLinecap="round"/>
          
          <path d="M 100 130 L 100 145" 
                stroke="url(#brainGradient)" strokeWidth="5" strokeLinecap="round"/>
          
          <circle cx="70" cy="80" r="8" fill="url(#accentGradient)" className="neuron neuron-1"/>
          <circle cx="130" cy="80" r="8" fill="url(#accentGradient)" className="neuron neuron-2"/>
          <circle cx="100" cy="100" r="10" fill="url(#accentGradient)" className="neuron neuron-3"/>
          <circle cx="85" cy="115" r="7" fill="url(#accentGradient)" className="neuron neuron-4"/>
          <circle cx="115" cy="115" r="7" fill="url(#accentGradient)" className="neuron neuron-5"/>
          
          <line x1="70" y1="80" x2="100" y2="100" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.5" className="synapse synapse-1"/>
          <line x1="130" y1="80" x2="100" y2="100" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.5" className="synapse synapse-2"/>
          <line x1="100" y1="100" x2="85" y2="115" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.5" className="synapse synapse-3"/>
          <line x1="100" y1="100" x2="115" y2="115" stroke="url(#brainGradient)" strokeWidth="2" opacity="0.5" className="synapse synapse-4"/>
          
          <g transform="translate(100, 155)">
            <rect x="-20" y="0" width="40" height="15" rx="7" fill="url(#accentGradient)"/>
            <circle cx="-8" cy="7" r="3" fill="white" opacity="0.8"/>
            <circle cx="8" cy="7" r="3" fill="white" opacity="0.8"/>
            <rect x="-12" y="5" width="2" height="5" rx="1" fill="white" opacity="0.6"/>
            <rect x="-14" y="7" width="6" height="2" rx="1" fill="white" opacity="0.6"/>
          </g>
        </g>
      </svg>
      
      {showText && (
        <span className="logo-text">
          <span className="logo-neuro">Neuro</span>
          <span className="logo-play">Play</span>
        </span>
      )}
    </div>
  );
}

export default Logo;
