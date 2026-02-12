/**
 * StorageManager - Gerenciador de Armazenamento
 * 
 * Gerencia persistência de dados no localStorage.
 * Inclui validação, exportação (LGPD) e tratamento de erros.
 * 
 * @module StorageManager
 * @version 1.0.0
 */

export class StorageManager {
  /**
   * Cria uma instância do StorageManager
   * @param {string} userId - ID do usuário
   */
  constructor(userId = 'default') {
    this.userId = userId;
    this.storageKey = `neuroplay_achievements_${userId}`;
    this.version = '1.0';
    this.initialized = false;
  }

  /**
   * Inicializa o StorageManager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Verifica se localStorage está disponível
      if (typeof localStorage === 'undefined') {
        throw new Error('localStorage não disponível');
      }
      
      this.initialized = true;
      console.log('✅ StorageManager inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar StorageManager:', error);
      throw error;
    }
  }

  /**
   * Obtém progresso de uma conquista específica
   * @param {string} achievementId - ID da conquista
   * @returns {Object} - Progresso da conquista
   */
  async getAchievementProgress(achievementId) {
    try {
      const data = this.load();
      if (!data || !data.achievements) {
        return { progress: 0, unlocked: false, unlockedAt: null };
      }
      
      return data.achievements[achievementId] || { progress: 0, unlocked: false, unlockedAt: null };
    } catch (error) {
      console.error('❌ Erro ao obter progresso:', error);
      return { progress: 0, unlocked: false, unlockedAt: null };
    }
  }

  /**
   * Atualiza progresso de uma conquista
   * @param {string} achievementId - ID da conquista
   * @param {Object} progress - Novo progresso
   * @returns {boolean} - true se atualizou com sucesso
   */
  async updateAchievementProgress(achievementId, progress) {
    try {
      const data = this.load() || { achievements: {}, stats: {} };
      
      if (!data.achievements) {
        data.achievements = {};
      }
      
      data.achievements[achievementId] = {
        ...data.achievements[achievementId],
        ...progress
      };
      
      return this.save(data);
    } catch (error) {
      console.error('❌ Erro ao atualizar progresso:', error);
      return false;
    }
  }

  /**
   * Desbloqueia uma conquista
   * @param {string} achievementId - ID da conquista
   * @param {number} timestamp - Timestamp do desbloqueio
   * @returns {boolean} - true se desbloqueou com sucesso
   */
  async unlockAchievement(achievementId, timestamp) {
    try {
      const data = this.load() || { achievements: {}, stats: {}, unlockedAchievements: [] };
      
      if (!data.achievements) {
        data.achievements = {};
      }
      
      if (!data.unlockedAchievements) {
        data.unlockedAchievements = [];
      }
      
      data.achievements[achievementId] = {
        ...data.achievements[achievementId],
        unlocked: true,
        unlockedAt: timestamp
      };
      
      if (!data.unlockedAchievements.includes(achievementId)) {
        data.unlockedAchievements.push(achievementId);
      }
      
      return this.save(data);
    } catch (error) {
      console.error('❌ Erro ao desbloquear conquista:', error);
      return false;
    }
  }

  /**
   * Limpa todos os dados de conquistas
   * @returns {boolean} - true se limpou com sucesso
   */
  async clearAllData() {
    return this.clear();
  }

  /**
   * Salva dados no localStorage
   * @param {Object} data - Dados do progresso do usuário
   * @returns {boolean} - true se salvou com sucesso
   */
  save(data) {
    try {
      // Valida dados antes de salvar
      if (!this.validate(data)) {
        console.error('❌ Dados inválidos, não foi possível salvar');
        return false;
      }

      const serialized = JSON.stringify({
        version: this.version,
        userId: this.userId,
        userProgress: data,
        lastSync: Date.now()
      });

      localStorage.setItem(this.storageKey, serialized);
      console.log('✅ Dados salvos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      
      // Verifica se é erro de quota excedida
      if (error.name === 'QuotaExceededError') {
        console.error('⚠️ localStorage cheio! Considere limpar dados antigos.');
      }
      
      return false;
    }
  }

  /**
   * Carrega dados do localStorage
   * @returns {Object|null} - Dados do usuário ou null se não existir
   */
  load() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      
      if (!serialized) {
        console.log('ℹ️ Nenhum dado salvo encontrado');
        return null;
      }

      const data = JSON.parse(serialized);

      // Verifica versão
      if (data.version !== this.version) {
        console.warn('⚠️ Versão incompatível, tentando migrar...');
        return this.migrate(data);
      }

      console.log('✅ Dados carregados com sucesso');
      return data.userProgress;
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      
      // Se JSON está corrompido, retorna null
      if (error instanceof SyntaxError) {
        console.error('⚠️ Dados corrompidos, iniciando do zero');
        this.clear();
      }
      
      return null;
    }
  }

  /**
   * Exporta dados em formato JSON (LGPD)
   * @returns {Object|null} - Dados formatados para exportação
   */
  export() {
    try {
      const data = this.load();
      
      if (!data) {
        console.warn('⚠️ Nenhum dado para exportar');
        return null;
      }

      return {
        format: 'JSON',
        standard: 'LGPD',
        version: this.version,
        exportedAt: new Date().toISOString(),
        userId: this.userId,
        data: data,
        rights: {
          portability: 'Você pode usar estes dados em outros sistemas',
          deletion: 'Você pode solicitar exclusão a qualquer momento',
          correction: 'Você pode solicitar correção de dados incorretos',
          access: 'Você tem direito de acessar todos os seus dados'
        }
      };
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      return null;
    }
  }

  /**
   * Limpa todos os dados do usuário (LGPD)
   * @returns {boolean} - true se limpou com sucesso
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('✅ Dados removidos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover dados:', error);
      return false;
    }
  }

  /**
   * Valida estrutura dos dados
   * @param {Object} data - Dados a validar
   * @returns {boolean} - true se dados são válidos
   */
  validate(data) {
    try {
      // Verifica estrutura básica
      if (!data || typeof data !== 'object') {
        console.error('Dados devem ser um objeto');
        return false;
      }

      // Verifica campos obrigatórios
      if (data.stats && typeof data.stats !== 'object') {
        console.error('Campo "stats" deve ser um objeto');
        return false;
      }

      if (data.unlockedAchievements && !Array.isArray(data.unlockedAchievements)) {
        console.error('Campo "unlockedAchievements" deve ser um array');
        return false;
      }

      if (data.achievements && typeof data.achievements !== 'object') {
        console.error('Campo "achievements" deve ser um objeto');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro na validação:', error);
      return false;
    }
  }

  /**
   * Migra dados de versões antigas
   * @param {Object} oldData - Dados da versão antiga
   * @returns {Object} - Dados migrados
   */
  migrate(oldData) {
    console.log(`🔄 Migrando dados da versão ${oldData.version} para ${this.version}`);
    
    // Por enquanto, apenas retorna os dados
    // Implementar lógica de migração quando houver novas versões
    return oldData.userProgress || oldData;
  }

  /**
   * Verifica se há dados salvos
   * @returns {boolean} - true se há dados
   */
  hasData() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  /**
   * Retorna tamanho dos dados em bytes
   * @returns {number} - Tamanho em bytes
   */
  getDataSize() {
    const data = localStorage.getItem(this.storageKey);
    return data ? new Blob([data]).size : 0;
  }

  /**
   * Retorna timestamp da última sincronização
   * @returns {number|null} - Timestamp ou null
   */
  getLastSync() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) return null;
      
      const data = JSON.parse(serialized);
      return data.lastSync || null;
    } catch (error) {
      return null;
    }
  }
}

export default StorageManager;
