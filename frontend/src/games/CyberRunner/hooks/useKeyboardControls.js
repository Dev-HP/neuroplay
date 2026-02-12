import { useState, useEffect } from 'react';

/**
 * Hook para controles de teclado
 * Suporta: Espaço (pulo), Seta Baixo (deslizar)
 */
export function useKeyboardControls() {
  const [keys, setKeys] = useState({
    jump: false,
    slide: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'Space':
        case 'ArrowUp':
          e.preventDefault();
          setKeys(prev => ({ ...prev, jump: true }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setKeys(prev => ({ ...prev, slide: true }));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'Space':
        case 'ArrowUp':
          setKeys(prev => ({ ...prev, jump: false }));
          break;
        case 'ArrowDown':
          setKeys(prev => ({ ...prev, slide: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
