const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'fitbuddy_users';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };

function draw() {
  const users = Object.values(load()).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  $('count').textContent = `${users.length} user record(s) stored in this browser.`;
  $('rows').innerHTML = users.map((u) => `<tr>
<td><strong>${esc(u.username)}</strong><br><small>${esc(u.user_id)}</small></td>
<td>${esc(u.age)} yrs<br>${esc(u.weight)} kg<br>${esc(u.intensity)}</td><td>${esc(u.goal)}</td>
<td><details><summary>View</summary><pre class="compact">${esc(JSON.stringify(u.original_plan, null, 2))}</pre></details></td>
<td>${u.updated_plan ? `<details><summary>View</summary><pre class="compact">${esc(JSON.stringify(u.updated_plan, null, 2))}</pre></details>` : '—'}</td>
<td><button class="danger-button" data-id="${esc(u.user_id)}">Delete</button></td></tr>`).join('');
}

$('lf').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const r = await fetch('/.netlify/functions/generate', { method: 'POST', body: JSON.stringify({ action: 'admin-check', password: $('pw').value }) });
    if (!r.ok) throw new Error();
    $('login').classList.add('hidden'); $('dash').classList.remove('hidden'); draw();
  } catch { $('aerr').textContent = 'Incorrect admin password.'; $('aerr').classList.remove('hidden'); }
});

$('rows').addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (id && confirm('Delete this user?')) { const u = load(); delete u[id]; localStorage.setItem(KEY, JSON.stringify(u)); draw(); }
});
