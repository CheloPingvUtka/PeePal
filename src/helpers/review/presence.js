export async function loadPresenceStats(locationId) {
  const res = await fetch(`http://127.0.0.1:8000/api/reviews/presence/stats/${locationId}`);
  if (!res.ok) {
    console.error('Ошибка загрузки статистики:', await res.text());
    return { present: 0, absent: 0, choice: null };
  }
  return res.json();
}

export async function sendPresenceVote({ locationId, vote }) {
  const res = await fetch('http://127.0.0.1:8000/api/reviews/presence/vote/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: locationId,
      vote, // 'present' или 'absent'
      user: 2, // временно — заменить на текущего пользователя
    }),
  });

  if (!res.ok) {
    console.error('Ошибка при голосовании:', await res.text());
  }

  return res.ok;
}
