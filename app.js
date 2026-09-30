const KEY = 'fitbuddy_users';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getUsers = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const saveUsers = (u) => localStorage.setItem(KEY, JSON.stringify(u));

async function api(payload) {
  const r = await fetch('/.netlify/functions/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}

function renderPlan(p) {
  let h = `<p class="muted">${esc(p.overview)}</p>`;
  (p.days || []).forEach((d) => {
    h += `<div class="day"><h3>${esc(d.day)} — ${esc(d.focus)}</h3><small>Warm-up: ${esc(d.warmup)}</small><ul>`;
    (d.exercises || []).forEach((e) => { h += `<li><strong>${esc(e.name)}</strong> — ${esc(e.sets_reps)} (rest ${esc(e.rest)})${e.notes ? ' <small>· ' + esc(e.notes) + '</small>' : ''}</li>`; });
    h += `</ul><small>Cooldown: ${esc(d.cooldown)}</small></div>`;
  });
  h += `<p class="tiny">${esc(p.safety_note)}</p>`;
  $('plan').innerHTML = h;
}

function show(u, updated, message) {
  $('home').classList.add('hidden'); $('result').classList.remove('hidden');
  $('rName').textContent = `Hey, ${u.username} 👋`;
  $('rSub').textContent = `Here is your ${u.goal} plan at ${u.intensity} intensity.`;
  const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
  $('strip').innerHTML = [['User ID', u.user_id], ['Age', u.age], ['Weight', u.weight + ' kg'], ['Goal', cap(u.goal)], ['Intensity', cap(u.intensity)]]
    .map(([k, v]) => `<div><small>${k}</small><strong>${esc(v)}</strong></div>`).join('');
  $('planTitle').textContent = (updated ? 'Updated' : 'Original') + ' 7-Day Plan';
  $('planBadge').textContent = updated ? 'AI revised' : 'AI generated';
  renderPlan(updated && u.updated_plan ? u.updated_plan : u.original_plan);
  $('tip').textContent = u.nutrition_tip;
  const m = $('msg'); m.classList.toggle('hidden', !message); m.textContent = message || '';
  window.scrollTo(0, 0);
}

let current = null;

$('gen').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target));
  const users = getUsers(); const err = $('err'); err.classList.add('hidden');
  const id = f.user_id.trim();
  if (users[id]) { err.textContent = `User ID '${id}' already exists. Use a different User ID.`; err.classList.remove('hidden'); return; }
  const btn = $('genBtn'); btn.disabled = true; btn.textContent = 'Generating… (may take ~20s)';
  try {
    const base = { username: f.username.trim(), age: +f.age, weight: +f.weight, goal: f.goal, intensity: f.intensity };
    const [w, t] = await Promise.all([api({ action: 'workout', ...base }), api({ action: 'tip', goal: f.goal })]);
    current = { user_id: id, ...base, original_plan: w.plan, updated_plan: null, nutrition_tip: t.tip, feedback: null, created_at: new Date().toISOString() };
    users[id] = current; saveUsers(users);
    show(current, false, w.source === 'demo' ? 'Showing a demo plan (Gemini API key not configured or unavailable).' : null);
  } catch (ex) { err.textContent = ex.message; err.classList.remove('hidden'); }
  btn.disabled = false; btn.textContent = 'Generate 7-Day Plan →';
});

$('fb').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('fbBtn'); btn.disabled = true; btn.textContent = 'Updating…';
  try {
    const base = current.updated_plan || current.original_plan;
    const d = await api({ action: 'update', plan: base, feedback: $('fbText').value, goal: current.goal, intensity: current.intensity });
    current.updated_plan = d.plan; current.feedback = $('fbText').value; current.updated_at = new Date().toISOString();
    const users = getUsers(); users[current.user_id] = current; saveUsers(users);
    show(current, true, d.notice || 'Your plan has been updated using your feedback.');
    $('fbText').value = '';
  } catch (ex) { alert(ex.message); }
  btn.disabled = false; btn.textContent = 'Update Plan with AI →';
});
