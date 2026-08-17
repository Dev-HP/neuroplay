import { apiUrl, isApiConfigured } from '../config/api';

export function getCurrentStudentId(searchParams, user) {
  return searchParams?.get('student_id') || user?.student_id || (user?.tipo === 'aluno' ? user.id : null);
}

export async function persistGameplay({ studentId, gameType, score, durationSeconds, acertos, erros, events = [], metadata = {} }) {
  if (!studentId) {
    throw new Error('Perfil de estudante não selecionado.');
  }
  if (!isApiConfigured()) {
    throw new Error('Backend não configurado.');
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(apiUrl('/api/v1/gameplay/sync'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      session_id: `${gameType}-${studentId}-${Date.now()}`,
      student_id: Number(studentId),
      game_type: gameType,
      score: Math.max(0, Math.round(Number(score) || 0)),
      duration_seconds: Math.max(0, Math.floor(Number(durationSeconds) || 0)),
      acertos: Math.max(0, Math.floor(Number(acertos) || 0)),
      erros: Math.max(0, Math.floor(Number(erros) || 0)),
      events: Array.isArray(events) ? events.slice(0, 200) : [],
      metadata
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || 'Não foi possível persistir a sessão.');
  }
  return payload;
}
