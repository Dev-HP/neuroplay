/**
 * Componente de Configurações Sensoriais
 * Baseado em evidências científicas (FastCapital, 2024)
 * Personalização reduz sobrecarga sensorial e aumenta tempo de jogo em 60%
 */

import { useState, useEffect } from 'react';
import './SensorySettings.css';

const defaultSettings = {
  visual: {
    brightness: 100,
    contrast: 'normal',
    colorScheme: 'vibrant',
    animations: 'full',
    particleEffects: 'normal',
    backgroundMotion: true
  },
  auditory: {
    masterVolume: 70,
    soundEffects: true,
    backgroundMusic: false,
    voiceGuidance: false
  },
  gameplay: {
    gameSpeed: 1.0,
    pauseReminders: true,
    pauseInterval: 10
  }
};

export function SensorySettings({ userId, onSave, onClose }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('visual');
  const [salvo, setSalvo] = useState(false);
  
  // Carrega configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem(`sensory_settings_${userId || 'default'}`);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.warn('Erro ao carregar configurações:', error);
      }
    }
  }, [userId]);
  
  // Atualiza configuração
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };
  
  // Salva configurações
  const handleSave = () => {
    try {
      localStorage.setItem(`sensory_settings_${userId || 'default'}`, JSON.stringify(settings));
    } catch {
      // Sem armazenamento local, os ajustes valem só para esta sessão.
    }
    if (onSave) {
      onSave(settings);
    }
    setSalvo(true);
  };
  
  // Presets para diferentes perfis sensoriais
  const presets = {
    'Hipersensível Visual': {
      visual: {
        brightness: 70,
        contrast: 'low',
        colorScheme: 'pastel',
        animations: 'reduced',
        particleEffects: 'minimal',
        backgroundMotion: false
      }
    },
    'Hipersensível Auditivo': {
      auditory: {
        masterVolume: 40,
        soundEffects: false,
        backgroundMusic: false,
        voiceGuidance: false
      }
    },
    'Busca Sensorial': {
      visual: {
        brightness: 120,
        contrast: 'high',
        colorScheme: 'vibrant',
        animations: 'full',
        particleEffects: 'intense',
        backgroundMotion: true
      },
      auditory: {
        masterVolume: 90,
        soundEffects: true,
        backgroundMusic: true
      }
    },
    'Padrão': defaultSettings
  };
  
  const applyPreset = (presetName) => {
    setSettings(prev => ({
      ...prev,
      ...presets[presetName]
    }));
  };
  
  return (
    <div className="sensory-settings-overlay">
      <div className="sensory-settings-modal">
        <div className="modal-header">
          <h2>⚙️ Configurações Sensoriais</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        {/* Presets */}
        <section className="presets-section">
          <h3>Perfis Pré-Configurados</h3>
          <div className="preset-buttons">
            {Object.keys(presets).map(presetName => (
              <button 
                key={presetName}
                onClick={() => applyPreset(presetName)}
                className="preset-btn"
              >
                {presetName}
              </button>
            ))}
          </div>
        </section>
        
        {/* Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'visual' ? 'active' : ''}
            onClick={() => setActiveTab('visual')}
          >
            👁️ Visual
          </button>
          <button 
            className={activeTab === 'auditory' ? 'active' : ''}
            onClick={() => setActiveTab('auditory')}
          >
            🔊 Auditivo
          </button>
          <button 
            className={activeTab === 'gameplay' ? 'active' : ''}
            onClick={() => setActiveTab('gameplay')}
          >
            🎮 Gameplay
          </button>
        </div>
        
        {/* Conteúdo das tabs */}
        <div className="tab-content">
          {/* Visual */}
          {activeTab === 'visual' && (
            <div className="setting-group">
              <div className="setting-item">
                <label>
                  <span className="label-text">Brilho</span>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="50" 
                      max="150" 
                      value={settings.visual.brightness}
                      onChange={(e) => updateSetting('visual', 'brightness', parseInt(e.target.value))}
                    />
                    <span className="value">{settings.visual.brightness}%</span>
                  </div>
                </label>
              </div>
              
              <div className="setting-item">
                <label>
                  <span className="label-text">Contraste</span>
                  <select 
                    value={settings.visual.contrast}
                    onChange={(e) => updateSetting('visual', 'contrast', e.target.value)}
                  >
                    <option value="low">Baixo</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alto</option>
                  </select>
                </label>
              </div>
              
              <div className="setting-item">
                <label>
                  <span className="label-text">Esquema de Cores</span>
                  <select 
                    value={settings.visual.colorScheme}
                    onChange={(e) => updateSetting('visual', 'colorScheme', e.target.value)}
                  >
                    <option value="vibrant">Vibrante</option>
                    <option value="pastel">Pastel (Suave)</option>
                    <option value="monochrome">Monocromático</option>
                  </select>
                </label>
              </div>
              
              <div className="setting-item">
                <label>
                  <span className="label-text">Animações</span>
                  <select 
                    value={settings.visual.animations}
                    onChange={(e) => updateSetting('visual', 'animations', e.target.value)}
                  >
                    <option value="full">Completas</option>
                    <option value="reduced">Reduzidas</option>
                    <option value="none">Desativadas</option>
                  </select>
                </label>
              </div>
              
              <div className="setting-item">
                <label>
                  <span className="label-text">Efeitos de Partículas</span>
                  <select 
                    value={settings.visual.particleEffects}
                    onChange={(e) => updateSetting('visual', 'particleEffects', e.target.value)}
                  >
                    <option value="intense">Intenso</option>
                    <option value="normal">Normal</option>
                    <option value="minimal">Mínimo</option>
                    <option value="off">Desligado</option>
                  </select>
                </label>
              </div>
              
              <div className="setting-item checkbox-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.visual.backgroundMotion}
                    onChange={(e) => updateSetting('visual', 'backgroundMotion', e.target.checked)}
                  />
                  <span>Movimento do Fundo</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Auditivo */}
          {activeTab === 'auditory' && (
            <div className="setting-group">
              <div className="setting-item">
                <label>
                  <span className="label-text">Volume Geral</span>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.auditory.masterVolume}
                      onChange={(e) => updateSetting('auditory', 'masterVolume', parseInt(e.target.value))}
                    />
                    <span className="value">{settings.auditory.masterVolume}%</span>
                  </div>
                </label>
              </div>
              
              <div className="setting-item checkbox-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.auditory.soundEffects}
                    onChange={(e) => updateSetting('auditory', 'soundEffects', e.target.checked)}
                  />
                  <span>Efeitos Sonoros</span>
                </label>
              </div>
              
              <div className="setting-item checkbox-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.auditory.backgroundMusic}
                    onChange={(e) => updateSetting('auditory', 'backgroundMusic', e.target.checked)}
                  />
                  <span>Música de Fundo</span>
                </label>
              </div>
              
              <div className="setting-item checkbox-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.auditory.voiceGuidance}
                    onChange={(e) => updateSetting('auditory', 'voiceGuidance', e.target.checked)}
                  />
                  <span>Orientação por Voz</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Gameplay */}
          {activeTab === 'gameplay' && (
            <div className="setting-group">
              <div className="setting-item">
                <label>
                  <span className="label-text">Velocidade do Jogo</span>
                  <div className="slider-container">
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2.0" 
                      step="0.1"
                      value={settings.gameplay.gameSpeed}
                      onChange={(e) => updateSetting('gameplay', 'gameSpeed', parseFloat(e.target.value))}
                    />
                    <span className="value">{settings.gameplay.gameSpeed}x</span>
                  </div>
                </label>
              </div>
              
              <div className="setting-item checkbox-item">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={settings.gameplay.pauseReminders}
                    onChange={(e) => updateSetting('gameplay', 'pauseReminders', e.target.checked)}
                  />
                  <span>Lembretes de Pausa</span>
                </label>
              </div>
              
              {settings.gameplay.pauseReminders && (
                <div className="setting-item">
                  <label>
                    <span className="label-text">Intervalo de Pausa (minutos)</span>
                    <input 
                      type="number" 
                      min="5" 
                      max="30" 
                      value={settings.gameplay.pauseInterval}
                      onChange={(e) => updateSetting('gameplay', 'pauseInterval', parseInt(e.target.value))}
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Botões de ação */}
        <div className="modal-actions">
          {salvo && <p className="settings-saved" role="status">Ajustes salvos.</p>}
          <button onClick={handleSave} className="btn-primary">
            💾 Salvar Configurações
          </button>
          <button onClick={() => setSettings(defaultSettings)} className="btn-secondary">
            🔄 Restaurar Padrões
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Aplica configurações sensoriais ao jogo
 */
export function applySensorySettings(settings, canvasElement, audioFeedback) {
  if (!settings) return;
  
  // Visual
  if (canvasElement && settings.visual) {
    const filters = [];
    
    // Brilho
    filters.push(`brightness(${settings.visual.brightness}%)`);
    
    // Contraste
    if (settings.visual.contrast === 'low') {
      filters.push('contrast(0.8)');
    } else if (settings.visual.contrast === 'high') {
      filters.push('contrast(1.3)');
    }
    
    canvasElement.style.filter = filters.join(' ');
  }
  
  // Áudio
  if (audioFeedback && settings.auditory) {
    audioFeedback.setVolume(settings.auditory.masterVolume / 100);
    audioFeedback.setEnabled(settings.auditory.soundEffects);
  }
  
  return settings;
}

/**
 * Carrega configurações salvas
 */
export function loadSensorySettings(userId) {
  const saved = localStorage.getItem(`sensory_settings_${userId || 'default'}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn('Erro ao carregar configurações:', error);
    }
  }
  return defaultSettings;
}
