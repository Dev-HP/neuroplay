/**
 * AchievementPanel - Painel de Conquistas
 * 
 * Interface visual para visualizar todas as conquistas e progresso do usuário.
 * Acessível via tecla 'A' ou botão no menu.
 * 
 * @module components/AchievementPanel
 * @version 1.0.0
 */

import React, { useState } from 'react';
import AchievementCard from './AchievementCard';
import { useAchievements } from '../hooks/useAchievements';
import { useAchievementStats } from '../hooks/useAchievementStats';
import './AchievementPanel.css';

const AchievementPanel = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rarity');

  const { achievements, loading: achievementsLoading } = useAchievements({
    category: activeCategory === 'all' ? undefined : activeCategory,
    unlocked: activeFilter === 'unlocked' ? true : activeFilter === 'locked' ? false : undefined,
    sortBy
  });

  const { stats, loading: statsLoading } = useAchievementStats();

  const categories = [
    { id: 'all', name: 'Todas', icon: '🏆' },
    { id: 'global', name: 'Global', icon: '🌍' },
    { id: 'cyber-runner', name: 'Cyber Runner', icon: '🏃' },
    { id: 'echo-temple', name: 'Echo Temple', icon: '🎵' },
    { id: 'sonic-jump', name: 'Sonic Jump', icon: '🦘' },
    { id: 'gravity-lab', name: 'Gravity Lab', icon: '🔬' }
  ];

  const filters = [
    { id: 'all', name: 'Todas' },
    { id: 'unlocked', name: 'Desbloqueadas' },
    { id: 'locked', name: 'Bloqueadas' }
  ];

  const sortOptions = [
    { id: 'rarity', name: 'Raridade' },
    { id: 'points', name: 'Pontos' },
    { id: 'recent', name: 'Recentes' },
    { id: 'name', name: 'Nome' }
  ];

  return (
    <div className="achievement-panel-overlay">
      <div className="achievement-panel">
        {/* Header */}
        <div className="achievement-panel-header">
          <div className="header-title">
            <h2>🏆 Conquistas</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>

          {/* Stats */}
          {stats && !statsLoading && (
            <div className="achievement-stats">
              <div className="stat-card">
                <div className="stat-value">{stats.unlocked}/{stats.total}</div>
                <div className="stat-label">Desbloqueadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{Math.round(stats.percentage)}%</div>
                <div className="stat-label">Progresso</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalPoints}</div>
                <div className="stat-label">Pontos</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="achievement-filters">
          {/* Category Tabs */}
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="tab-icon">{cat.icon}</span>
                <span className="tab-name">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Filter and Sort */}
          <div className="filter-controls">
            <div className="filter-group">
              <label>Filtro:</label>
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                {filters.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ordenar:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                {sortOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="achievement-grid">
          {achievementsLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando conquistas...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <p>Nenhuma conquista encontrada</p>
            </div>
          ) : (
            achievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onClick={() => console.log('Achievement clicked:', achievement.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;
