import { useId } from 'react';
import './Logo.css';

/**
 * Logo do NeuroPlay: um laço de infinito — símbolo da neurodiversidade criado
 * pela própria comunidade autista — desenhado como uma fita contínua que vai do
 * azul (calma) ao dourado, com um botão "play" no laço direito (brincar) e um
 * ponto no esquerdo (a mente). Evita o quebra-cabeça, símbolo contestado.
 */
const INFINITO = 'M100 100 C 116 66, 172 58, 172 100 C 172 142, 116 134, 100 100 C 84 66, 28 58, 28 100 C 28 142, 84 134, 100 100 Z';

export function LogoMark({ size = 60, withBackground = false, title = 'NeuroPlay' }) {
  const id = useId().replace(/:/g, '');
  const corPlay = withBackground ? '#ffffff' : '#e3b341';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-svg"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`np-fita-${id}`} x1="28" y1="0" x2="172" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b8fd6" />
          <stop offset="55%" stopColor="#3fae9c" />
          <stop offset="100%" stopColor="#e3b341" />
        </linearGradient>
        <linearGradient id={`np-fundo-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22406b" />
          <stop offset="100%" stopColor="#16294a" />
        </linearGradient>
      </defs>
      {withBackground && <rect x="8" y="8" width="184" height="184" rx="48" fill={`url(#np-fundo-${id})`} />}
      <path d={INFINITO} fill="none" stroke={`url(#np-fita-${id})`} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M133 89 L151 100 L133 111 Z" fill={corPlay} stroke={corPlay} strokeWidth="6" strokeLinejoin="round" />
      <circle cx="60" cy="100" r="8" fill={withBackground ? '#8fd0c2' : '#3fae9c'} />
    </svg>
  );
}

function Logo({ size = 'medium', showText = true, animated = true }) {
  const sizes = { small: 40, medium: 56, large: 80, xlarge: 120 };
  const px = sizes[size] || sizes.medium;

  return (
    <div className={`logo-container ${animated ? 'animated' : ''} logo-${size}`}>
      <LogoMark size={px} withBackground={!showText} />
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
