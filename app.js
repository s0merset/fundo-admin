'use strict';
/* Fundo Admin: the co-op side of the Fundo app.
   Static prototype for GitHub Pages: sample data is seeded and saved in this browser (localStorage).
   shortcut: no backend or real auth; connect staff accounts and the co-op's records before going live. */

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const peso = n => '₱' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const peso0 = n => '₱' + Math.round(n).toLocaleString('en-US');
const DAY = 864e5, HR = 36e5, now = () => Date.now();
const sum = (a, f) => a.reduce((t, x) => t + f(x), 0);
const day = s => new Date(s + 'T00:00').getTime();
const dfmt = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const initials = n => String(n).split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
function ago(t) {
  const m = Math.round((now() - t) / 6e4);
  if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60); if (h < 24) return h + ' hr ago';
  const d = Math.round(h / 24); return d === 1 ? 'yesterday' : d + ' days ago';
}

const ICON = {
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  inbox: '<path d="M4 13l2.5-7h11L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h4.5l1 2h5l1-2H20"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .8 3.2 2.6 3.6 5.2"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12l5 5 9-10"/>',
  flag: '<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>', doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  chev: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M15 6l-6 6 6 6"/>', wallet: '<path d="M4 7a2 2 0 0 1 2-2h12v4"/><path d="M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2z"/><circle cx="16" cy="14" r="1"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 11h18"/>', msg: '<path d="M4 5h16v11H9l-5 4z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>', pause: '<path d="M9 6v12M15 6v12"/>',
  side: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>'
};
const ic = (n, s = 18, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
const logo = (s, fg = '#191C15', dot = '#fff') => `<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="${fg}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"><path d="M23 53V23a13 13 0 0 1 13-13h8"/><path d="M11 31h24"/></g><circle cx="47" cy="51" r="9" fill="${dot}"/></svg>`;
const brand = s => `<div class="brand" role="img" aria-label="Fundo"><span class="brand-ic">${logo(s || 21)}</span><span class="brand-w" aria-hidden="true">fundo</span></div>`;

/* ---------- co-op rules (sample policy, same as the app) ---------- */
const PRODUCTS = {
  salary: { n: 'Salary Loan', rate: 1, mult: 8, cap: 150000, co: true, docs: ['id', 'pay', 'coe'] },
  emergency: { n: 'Emergency Loan', rate: 1.5, mult: 2, cap: 20000, co: true, docs: ['id', 'proof'] },
  livelihood: { n: 'Livelihood Loan', rate: 1.25, mult: 10, cap: 200000, co: true, docs: ['id', 'permit', 'biz'] },
  starter: { n: 'Starter Loan', rate: 1.5, mult: 2, cap: 10000, co: false, docs: ['id', 'pay'] }
};
const DOCS = { id: 'Valid ID', pay: 'Proof of income', coe: 'Certificate of employment', proof: 'Proof of the emergency', permit: 'Business permit', biz: 'Photo of the business' };
const FILES = { id: 'philsys-id.jpg', pay: 'payslip-oct-2026.pdf', coe: 'certificate-of-employment.pdf', proof: 'hospital-bill.jpg', permit: 'barangay-business-permit.pdf', biz: 'store-front.jpg' };
const STATUS = { new: ['New', 'blue'], review: ['In review', 'orange'], approved: ['Approved', 'teal'], released: ['Released', 'lime'], rejected: ['Rejected', 'red'] };
const ROLES = {
  admin: { n: 'Co-op admin', can: ['loans.decide', 'docs.verify', 'members.edit', 'members.delete', 'staff.manage'] },
  credit: { n: 'Credit manager', can: ['loans.decide', 'docs.verify'] },
  officer: { n: 'Membership officer', can: ['members.edit'] }
};
const PERMS = [['view', 'See loan applications and member records'], ['docs.verify', 'Verify or flag documents'], ['loans.decide', 'Approve, reject and release loans'], ['members.edit', 'Add, edit and deactivate members'], ['members.delete', 'Delete member records'], ['staff.manage', 'Manage staff and roles']];
const amort = (P, r, n) => { r /= 100; return r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n; };
function calc(a) {
  const p = PRODUCTS[a.product], mo = amort(a.amount, p.rate, a.term), fee = a.amount * .01, cbu = a.amount * .02;
  return { p, mo, total: mo * a.term, fee, cbu, net: a.amount - fee - cbu, ratio: a.income ? mo / a.income * 100 : 0 };
}
const limitFor = (a, m) => { const p = PRODUCTS[a.product], base = m.paid + m.sav; return Math.min(p.cap, a.product === 'starter' ? 5000 + base * 2 : base * p.mult); };
const monthsSince = s => (now() - day(s)) / (30.4 * DAY);

/* ---------- data ---------- */
function seed() {
  const t = now();
  const staff = [
    { id: 's1', name: 'Liza Manalo', title: 'Co-op manager', email: 'liza.manalo@bayanihanmpc.coop', role: 'admin' },
    { id: 's2', name: 'Renato Cruz', title: 'Credit committee chair', email: 'renato.cruz@bayanihanmpc.coop', role: 'credit' },
    { id: 's3', name: 'Joy Valdez', title: 'Membership officer', email: 'joy.valdez@bayanihanmpc.coop', role: 'officer' }
  ];
  const rows = [
    ['m1', 'BMC-004821', 'Ana', 'Santos', '2019-03-06', 'Regular', 5000, 5000, 12480.5, '0917 000 0000', 'Cebu City', 14],
    ['m2', 'BMC-003377', 'Jose', 'Ramos', '2016-07-14', 'Regular', 10000, 10000, 38200, '0918 221 4410', 'Cebu City', 48],
    ['m3', 'BMC-005120', 'Lito', 'Garcia', '2020-01-20', 'Regular', 5000, 5000, 9100, '0927 552 1043', 'Mandaue City', 22],
    ['m4', 'BMC-005388', 'Carmela', 'Reyes', '2021-02-11', 'Regular', 6000, 6000, 15750, '0917 845 2201', 'Cebu City', 30],
    ['m5', 'BMC-004102', 'Ramon', 'Bautista', '2018-05-30', 'Regular', 8000, 8000, 21400, '0919 330 7782', 'Talisay City', 41],
    ['m6', 'BMC-005712', 'Teresita', 'Villanueva', '2022-09-03', 'Regular', 3000, 3000, 4200, '0916 772 0094', 'Cebu City', 12],
    ['m7', 'BMC-005601', 'Paolo', 'Mendoza', '2022-03-18', 'Regular', 4000, 4000, 6050, '0905 118 6623', 'Lapu-Lapu City', 18],
    ['m8', 'BMC-006014', 'Grace', 'Aquino', '2026-08-27', 'Regular', 2000, 500, 0, '0926 410 5578', 'Cebu City', 0],
    ['m9', 'BMC-004455', 'Danilo', 'Flores', '2018-11-08', 'Regular', 7000, 7000, 18900, '0917 664 3109', 'Consolacion', 36],
    ['m10', 'BMC-005233', 'Rowena', 'Castillo', '2021-06-25', 'Associate', 2000, 2000, 3100, '0998 213 4467', 'Cebu City', 9],
    ['m11', 'BMC-005903', 'Mark Anthony', 'Torres', '2023-04-15', 'Regular', 3000, 3000, 7300, '0915 902 3381', 'Mandaue City', 14],
    ['m12', 'BMC-004980', 'Jocelyn', 'Navarro', '2019-10-02', 'Regular', 5000, 5000, 11200, '0939 551 0420', 'Cebu City', 29],
    ['m13', 'BMC-005477', 'Ernesto', 'Pascual', '2021-08-09', 'Regular', 4000, 4000, 5600, '0917 233 8840', 'Talisay City', 20],
    ['m14', 'BMC-003921', 'Lourdes', 'Abad', '2017-02-21', 'Regular', 9000, 9000, 27650, '0918 470 1192', 'Cebu City', 60]
  ];
  const members = rows.map((r, i) => ({
    id: r[0], no: r[1], first: r[2], last: r[3], accepted: r[4], type: r[5], sub: r[6], paid: r[7], sav: r[8], mobile: r[9], city: r[10], onTime: r[11],
    status: 'Active', tin: `${402 + i * 7}-${118 + i * 3}-${675 - i * 11}-000`, res: `${r[4].slice(0, 4)}-${String(30 + i * 5).padStart(3, '0')}`, pmes: true
  }));
  const ST = { v: 'verified', p: 'pending', f: 'flagged' };
  const A = (id, mid, product, amount, term, purpose, income, cm, hrs, status, docs, extra) => ({
    id, memberId: mid, product, amount, term, purpose, income, disb: 'GCash', submitted: t - hrs * HR, status, waiting: false,
    comaker: cm ? { name: cm[0], no: cm[1], confirmed: cm[2] } : null,
    docs: PRODUCTS[product].docs.map((k, i) => ({ k, state: ST[docs[i] || 'p'], note: '' })),
    notes: [], decision: null, reviewAt: null, reviewBy: null, releasedAt: null, releaseRef: '', ...(extra || {})
  });
  const apps = [
    A('LN-2611-0144', 'm11', 'salary', 40000, 12, 'Home repair or improvement', 26000, ['Jocelyn Navarro', 'BMC-004980', false], .4, 'new', 'ppp'),
    A('LN-2611-0142', 'm4', 'salary', 60000, 24, 'Tuition and school needs', 32000, ['Jose Ramos', 'BMC-003377', true], 2, 'new', 'vpp'),
    A('LN-2611-0139', 'm5', 'livelihood', 80000, 12, 'Business capital', 45000, ['Lito Garcia', 'BMC-005120', false], 27, 'review', 'vpp', { reviewAt: t - 20 * HR, reviewBy: 's2' }),
    A('LN-2611-0137', 'm6', 'emergency', 8000, 6, 'Medical or hospital bills', 18000, ['Lourdes Abad', 'BMC-003921', true], 5, 'new', 'pp'),
    A('LN-2611-0135', 'm13', 'emergency', 6000, 6, 'Typhoon repairs', 21000, ['Ramon Bautista', 'BMC-004102', true], 30, 'review', 'vv', { reviewAt: t - 26 * HR, reviewBy: 's2' }),
    A('LN-2611-0131', 'm7', 'salary', 150000, 24, 'Debt consolidation', 16000, ['Danilo Flores', 'BMC-004455', true], 74, 'review', 'vvf', { reviewAt: t - 70 * HR, reviewBy: 's2', waiting: true }),
    A('LN-2610-0125', 'm12', 'salary', 30000, 18, 'Appliance or gadget', 24000, ['Lourdes Abad', 'BMC-003921', true], 120, 'approved', 'vvv', { reviewAt: t - 110 * HR, reviewBy: 's2', decision: { by: 's2', at: t - 96 * HR, kind: 'approved', note: '' } }),
    A('LN-2610-0118', 'm8', 'starter', 5000, 6, 'Farm inputs or equipment', 15000, null, 170, 'approved', 'vv', { reviewAt: t - 160 * HR, reviewBy: 's2', decision: { by: 's2', at: t - 150 * HR, kind: 'approved', note: 'First loan for a new member.' } }),
    A('LN-2610-0102', 'm9', 'livelihood', 50000, 12, 'Business capital', 38000, ['Jose Ramos', 'BMC-003377', true], 290, 'released', 'vvv', { reviewAt: t - 280 * HR, reviewBy: 's2', decision: { by: 's2', at: t - 262 * HR, kind: 'approved', note: '' }, releasedAt: t - 240 * HR, releaseRef: 'GC 8841 2207 551', disb: 'GCash' }),
    A('LN-2610-0097', 'm10', 'emergency', 10000, 3, 'Medical or hospital bills', 14000, ['Paolo Mendoza', 'BMC-005601', false], 340, 'rejected', 'vp', { reviewAt: t - 330 * HR, reviewBy: 's1', decision: { by: 's1', at: t - 320 * HR, kind: 'rejected', reason: 'Co-maker is not in good standing', note: 'Please name a co-maker with no past-due loans and apply again.' } })
  ];
  apps[5].docs[2].note = 'Name on the certificate does not match the member record';
  apps[5].notes.push({ by: 's2', at: t - 68 * HR, text: 'Payment would be 44% of take-home pay and the amount is over his limit. Asked Paolo for his latest payslip and a smaller amount.' });
  apps[2].notes.push({ by: 's2', at: t - 19 * HR, text: 'Visited the store in Talisay. Stock and foot traffic look good. Waiting on co-maker confirmation.' });
  const log = [
    { at: t - .4 * HR, by: null, text: 'Mark Anthony Torres applied for a ₱40,000 Salary Loan in the app', ref: '#/loans/LN-2611-0144' },
    { at: t - 2 * HR, by: null, text: 'Carmela Reyes applied for a ₱60,000 Salary Loan in the app', ref: '#/loans/LN-2611-0142' },
    { at: t - 5 * HR, by: null, text: 'Teresita Villanueva applied for an ₱8,000 Emergency Loan in the app', ref: '#/loans/LN-2611-0137' },
    { at: t - 19 * HR, by: 's2', text: 'added a note to Ramon Bautista\'s Livelihood Loan', ref: '#/loans/LN-2611-0139' },
    { at: t - 26 * HR, by: 's2', text: 'started reviewing Ernesto Pascual\'s Emergency Loan', ref: '#/loans/LN-2611-0135' },
    { at: t - 68 * HR, by: 's2', text: 'asked Paolo Mendoza for more information', ref: '#/loans/LN-2611-0131' },
    { at: t - 96 * HR, by: 's2', text: 'approved Jocelyn Navarro\'s ₱30,000 Salary Loan', ref: '#/loans/LN-2610-0125' }
  ];
  return { v: 1, coop: { n: 'Bayanihan Multi-Purpose Cooperative', sh: 'Bayanihan MPC', city: 'Cebu City', pre: 'BMC' }, staff, members, apps, log, me: null };
}
const KEY = 'fundo-admin-v1';
let D;
function load() { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.v === 1) { D = v; return; } } catch (e) { } D = seed(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) { } }
const member = id => D.members.find(m => m.id === id);
const app = id => D.apps.find(a => a.id === id);
const staff = id => D.staff.find(s => s.id === id);
// sample staff photos (stock portraits from randomuser.me); anyone else gets initials
const PHOTO = { s1: 'media/liza.jpg', s2: 'media/renato.jpg', s3: 'media/joy.jpg' };
const sav = (s, cls = 'ink') => s && PHOTO[s.id] ? `<span class="av ph"><img src="${PHOTO[s.id]}" alt=""></span>` : `<span class="av ${cls}">${initials(s?.name || '?')}</span>`;
const me = () => staff(D.me);
const can = p => p === 'view' || !!(me() && ROLES[me().role].can.includes(p));
const full = m => m ? `${m.first} ${m.last}` : 'Removed member';
const waiting = () => D.apps.filter(a => a.status === 'new' || a.status === 'review');
const activeLoans = mid => D.apps.filter(a => a.memberId === mid && ['new', 'review', 'approved', 'released'].includes(a.status));
function log(text, ref) { D.log.unshift({ at: now(), by: D.me, text, ref: ref || '' }); D.log = D.log.slice(0, 100); }

/* ---------- credit checks (the five Cs) ---------- */
function checks(a) {
  const m = member(a.memberId), k = calc(a), p = k.p, lim = limitFor(a, m), out = [];
  const months = monthsSince(m.accepted);
  out.push(m.status !== 'Active' ? ['Character', 'Member is inactive', 'bad']
    : months < 6 && a.product !== 'starter' ? ['Character', `Member for ${Math.max(1, Math.round(months))} months. Policy asks for 6.`, 'bad']
    : m.onTime ? ['Character', `${m.onTime} on-time payments, no penalties`, 'ok'] : ['Character', 'New member. Starter Loans need no history.', 'ok']);
  out.push(['Capacity', `Payment of ${peso(k.mo)} is ${k.ratio.toFixed(0)}% of take-home pay (${peso0(a.income)})`, k.ratio <= 30 ? 'ok' : k.ratio <= 40 ? 'warn' : 'bad']);
  out.push(['Capital', a.amount <= lim ? `Within the ${peso0(lim)} limit from ${peso0(m.paid + m.sav)} in savings and shares` : `Over the ${peso0(lim)} limit by ${peso0(a.amount - lim)}`, a.amount <= lim ? 'ok' : 'bad']);
  out.push(['Co-maker', !p.co ? 'Not needed for a Starter Loan' : a.comaker.confirmed ? `${a.comaker.name} · ${a.comaker.no} confirmed by text` : `Waiting for ${a.comaker.name} to confirm`, !p.co || a.comaker.confirmed ? 'ok' : 'warn', p.co && !a.comaker.confirmed]);
  const v = a.docs.filter(d => d.state === 'verified').length, f = a.docs.some(d => d.state === 'flagged');
  out.push(['Documents', `${v} of ${a.docs.length} verified${f ? ', 1 flagged' : ''}`, f ? 'bad' : v === a.docs.length ? 'ok' : 'warn']);
  return out;
}
const blockers = a => { const p = PRODUCTS[a.product], r = []; if (a.docs.some(d => d.state !== 'verified')) r.push('verify every document'); if (p.co && !a.comaker.confirmed) r.push('get the co-maker\'s confirmation'); return r; };

/* ---------- views ---------- */
const UI = { lf: 'waiting', lq: '', mf: 'all', mq: '', df: 'todo', af: 'all', ob: null };
const statusPill = a => `<span class="pill ${STATUS[a.status][1]}">${STATUS[a.status][0]}</span>${a.waiting && a.status === 'review' ? ' <span class="pill grey">Waiting on member</span>' : ''}`;
function capPill(a) { const r = calc(a).ratio; return `<span class="pill ${r <= 30 ? 'teal' : r <= 40 ? 'orange' : 'red'}">${r.toFixed(0)}% of pay</span>`; }
function docPill(a) { const v = a.docs.filter(d => d.state === 'verified').length, f = a.docs.some(d => d.state === 'flagged'); return `<span class="pill ${f ? 'red' : v === a.docs.length ? 'teal' : 'grey'}">${f ? ic('flag', 12, 2.4) : ''}${v}/${a.docs.length} verified</span>`; }

function logRow(l) {
  const s = staff(l.by), tag = l.ref ? 'a' : 'div';
  return `<${tag}${l.ref ? ` href="${l.ref}"` : ''} class="lrow">${s ? sav(s) : `<span class="av">${ic('user', 16)}</span>`}<span class="grow"><b style="font-weight:500">${s ? `<strong>${esc(s.name)}</strong> ` : ''}${esc(l.text)}</b><small>${ago(l.at)}${s ? '' : ' · from the Fundo app'}</small></span></${tag}>`;
}
function vOverview() {
  const w = waiting(), amt = sum(w, a => a.amount), old = w.slice().sort((a, b) => a.submitted - b.submitted)[0];
  const rel = D.apps.filter(a => a.status === 'released' && a.releasedAt > now() - 30 * DAY);
  const dec = D.apps.filter(a => a.decision), yes = dec.filter(a => a.decision.kind === 'approved').length;
  const avg = dec.length ? sum(dec, a => a.decision.at - a.submitted) / dec.length / DAY : 0;
  const act = D.members.filter(m => m.status === 'Active').length, nm = D.members.filter(m => day(m.accepted) > now() - 90 * DAY).length;
  const h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const kpi = (tile, icon, l, v, e) => `<div class="kpi"><span class="tile ${tile}">${ic(icon, 18)}</span><small>${l}</small><b>${v}</b><em>${e}</em></div>`;
  const queue = w.slice().sort((a, b) => a.submitted - b.submitted).slice(0, 6);
  return `<div class="page-h"><div><p class="eyebrow">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p><h1>${greet}, ${esc(me().name.split(' ')[0])}</h1></div></div>
  ${welcomeCard()}
  <section class="hero" aria-label="Waiting for a decision"><span class="wm" aria-hidden="true">${logo(260)}</span>
    <div><p class="hl">Waiting for a decision</p><div class="ha">${w.length} <span>application${w.length === 1 ? '' : 's'}</span></div>
    <p class="hs">${peso0(amt)} requested${old ? ` · oldest sent ${ago(old.submitted)}` : ''}</p></div>
    <a class="btn dark" href="#/loans">Open the queue ${ic('chev', 16, 2.2)}</a></section>
  <div class="kpis">
    ${kpi('t-blue', 'users', 'Active members', act, `${nm} joined in the last 90 days`)}
    ${kpi('t-teal', 'wallet', 'Released, last 30 days', peso0(sum(rel, a => a.amount)), `${rel.length} loan${rel.length === 1 ? '' : 's'}`)}
    ${kpi('t-orange', 'clock', 'Average time to decide', avg ? avg.toFixed(1) + ' days' : '—', 'From app request to decision')}
    ${kpi('t-purple', 'check', 'Approval rate', dec.length ? Math.round(yes / dec.length * 100) + '%' : '—', `${yes} of ${dec.length} decided`)}
  </div>
  <div class="cols">
    <section class="card"><div class="ghd"><h2>Needs attention</h2><a href="#/loans">See all</a></div>
      ${queue.length ? queue.map(a => { const m = member(a.memberId), late = now() - a.submitted > 2 * DAY; return `<a class="lrow" href="#/loans/${a.id}"><span class="av">${initials(full(m))}</span><span class="grow"><b>${esc(full(m))}</b><small>${PRODUCTS[a.product].n} · ${peso0(a.amount)} · ${a.term} months</small></span><span class="rv">${statusPill(a)}<small class="${late ? 'warn' : ''}">Sent ${ago(a.submitted)}</small></span></a>`; }).join('') : '<p class="empty">Nothing waiting. Every application has a decision.</p>'}
    </section>
    <section class="card"><div class="ghd"><h2>Recent activity</h2><a href="#/activity">See all</a></div>
      ${D.log.slice(0, 7).map(logRow).join('')}
    </section>
  </div>`;
}

function loanList() {
  const q = UI.lq.trim().toLowerCase();
  return D.apps.filter(a => (UI.lf === 'all' || (UI.lf === 'waiting' ? ['new', 'review'].includes(a.status) : a.status === UI.lf)) &&
    (!q || `${full(member(a.memberId))} ${member(a.memberId)?.no} ${a.id} ${PRODUCTS[a.product].n}`.toLowerCase().includes(q)))
    .sort((a, b) => b.submitted - a.submitted);
}
function loanRows() {
  const l = loanList();
  return l.length ? l.map(a => { const m = member(a.memberId); return `<tr data-href="#/loans/${a.id}" tabindex="0"><td><div class="who"><span class="av">${initials(full(m))}</span><span><a href="#/loans/${a.id}">${esc(full(m))}</a><small>${esc(m?.no || '')} · ${a.id}</small></span></div></td>
    <td>${PRODUCTS[a.product].n}<small>${a.term} months · ${esc(a.purpose)}</small></td><td class="num"><b>${peso0(a.amount)}</b><small>${peso(calc(a).mo)}/mo</small></td>
    <td>${capPill(a)}</td><td>${docPill(a)}</td><td class="tab">${ago(a.submitted)}</td><td>${statusPill(a)}</td></tr>`; }).join('')
    : `<tr><td colspan="7" class="empty">No applications match. Try another filter or search.</td></tr>`;
}
function vLoans() {
  const c = k => k === 'all' ? D.apps.length : k === 'waiting' ? waiting().length : D.apps.filter(a => a.status === k).length;
  const chip = (k, l) => `<button class="chip" data-act="lfilter" data-k="${k}" aria-pressed="${UI.lf === k}">${l}<span class="c">${c(k)}</span></button>`;
  return `<div class="page-h"><div><h1>Loan applications</h1><p class="mut">Sent by members from the Fundo app. Open one to check documents and decide.</p></div></div>
  <div class="toolbar"><div class="chips" role="group" aria-label="Filter by status">${chip('waiting', 'Needs a decision')}${chip('new', 'New')}${chip('review', 'In review')}${chip('approved', 'Approved')}${chip('released', 'Released')}${chip('rejected', 'Rejected')}${chip('all', 'All')}</div>
  <label class="search">${ic('search', 16)}<input id="lq" type="search" placeholder="Name, member no. or reference" value="${esc(UI.lq)}" aria-label="Search applications" autocomplete="off"></label></div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Applicant</th><th>Loan</th><th class="num">Amount</th><th>Ability to pay</th><th>Documents</th><th>Sent</th><th>Status</th></tr></thead><tbody id="ltb">${loanRows()}</tbody></table></div>`;
}

function memberList() {
  const q = UI.mq.trim().toLowerCase();
  return D.members.filter(m => (UI.mf === 'all' || (UI.mf === 'Inactive' ? m.status === 'Inactive' : m.type === UI.mf && m.status === 'Active')) &&
    (!q || `${full(m)} ${m.no} ${m.mobile} ${m.city}`.toLowerCase().includes(q))).sort((a, b) => a.last.localeCompare(b.last));
}
function memberRows() {
  const l = memberList();
  return l.length ? l.map(m => { const loans = D.apps.filter(a => a.memberId === m.id && a.status === 'released').length, p = Math.min(100, Math.round(m.paid / m.sub * 100));
    return `<tr data-href="#/members/${m.id}" tabindex="0"><td><div class="who"><span class="av">${initials(full(m))}</span><span><a href="#/members/${m.id}">${esc(full(m))}</a><small>${esc(m.no)} · ${esc(m.mobile)}</small></span></div></td>
    <td>${esc(m.type)}</td><td class="tab">${dfmt(day(m.accepted))}</td><td>${peso0(m.paid)} <small>of ${peso0(m.sub)} subscribed</small><div class="bar"><i style="width:${p}%"></i></div></td>
    <td class="num">${peso(m.sav)}</td><td class="num">${loans || '—'}</td><td>${m.status === 'Active' ? '<span class="pill teal">Active</span>' : '<span class="pill grey">Inactive</span>'}</td></tr>`; }).join('')
    : `<tr><td colspan="7" class="empty">No members match.</td></tr>`;
}
function vMembers() {
  const chip = (k, l) => `<button class="chip" data-act="mfilter" data-k="${k}" aria-pressed="${UI.mf === k}">${l}</button>`;
  return `<div class="page-h"><div><h1>Members</h1><p class="mut">${D.members.length} records. Members apply at the branch; add them here once the board accepts them.</p></div>
  ${can('members.edit') ? `<button class="btn dark" data-act="memberNew">${ic('plus', 16, 2.2)} Add member</button>` : lockNote('Membership officers and admins add members')}</div>
  <div class="toolbar"><div class="chips" role="group" aria-label="Filter members">${chip('all', 'All')}${chip('Regular', 'Regular')}${chip('Associate', 'Associate')}${chip('Inactive', 'Inactive')}</div>
  <label class="search">${ic('search', 16)}<input id="mq" type="search" placeholder="Name, member no., mobile or city" value="${esc(UI.mq)}" aria-label="Search members" autocomplete="off"></label></div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Member</th><th>Type</th><th>Accepted</th><th>Share capital</th><th class="num">Savings</th><th class="num">Active loans</th><th>Status</th></tr></thead><tbody id="mtb">${memberRows()}</tbody></table></div>`;
}

function vStaff() {
  const row = s => `<div class="lrow">${sav(s, s.id === D.me ? 'ink' : '')}<span class="grow"><b>${esc(s.name)}${s.id === D.me ? ' <span class="pill grey">You</span>' : ''}</b><small>${esc(s.title)} · ${esc(s.email)}</small></span>
    <select class="in" style="width:190px" data-role-for="${s.id}" aria-label="Role for ${esc(s.name)}" ${s.id === D.me ? 'disabled title="You can\'t change your own role"' : ''}>${Object.keys(ROLES).map(r => `<option value="${r}" ${s.role === r ? 'selected' : ''}>${ROLES[r].n}</option>`).join('')}</select>
    ${s.id === D.me ? '<span style="width:36px"></span>' : `<button class="ib" data-act="staffRemove" data-id="${s.id}" aria-label="Remove ${esc(s.name)}">${ic('trash', 17)}</button>`}</div>`;
  return `<div class="page-h"><div><h1>Staff and roles</h1><p class="mut">Who can sign in to Fundo Admin for ${esc(D.coop.sh)}, and what they can do.</p></div><button class="btn dark" data-act="staffInvite">${ic('plus', 16, 2.2)} Invite staff</button></div>
  <div class="cols"><section class="card"><div class="ghd"><h2>Staff</h2></div>${D.staff.map(row).join('')}</section>
  <section class="card"><div class="ghd"><h2>What each role can do</h2></div><table class="perm"><thead><tr><th></th>${Object.values(ROLES).map(r => `<th class="c">${r.n.replace(' ', '<br>')}</th>`).join('')}</tr></thead>
  <tbody>${PERMS.map(p => `<tr><td>${p[1]}</td>${Object.keys(ROLES).map(r => { const y = p[0] === 'view' || ROLES[r].can.includes(p[0]); return `<td class="c ${y ? 'y' : 'n'}">${y ? ic('check', 17, 2.6) + '<span class="sr">Yes</span>' : '—'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></section></div>`;
}
/* ---------- more tabs: all read from the same applications, rules and log ---------- */
const isOpen = a => a.status === 'new' || a.status === 'review';
const who = (a, base) => { const m = member(a.memberId); return `<div class="who"><span class="av">${initials(full(m))}</span><span><a href="#/${base}/${a.id}">${esc(full(m))}</a><small>${esc(m?.no || '')} · ${a.id}</small></span></div>`; };
const DOCF = { todo: x => x.d.state === 'pending' && isOpen(x.a), flagged: x => x.d.state === 'flagged', verified: x => x.d.state === 'verified', all: () => true };
const allDocs = () => D.apps.flatMap(a => a.docs.map(d => ({ a, d })));
function vDocuments() {
  const docs = allDocs(), l = docs.filter(DOCF[UI.df]).sort((x, y) => x.a.submitted - y.a.submitted);
  const chip = (k, t) => `<button class="chip" data-act="dfilter" data-k="${k}" aria-pressed="${UI.df === k}">${t}<span class="c">${docs.filter(DOCF[k]).length}</span></button>`;
  const pill = d => `<span class="pill ${d.state === 'verified' ? 'teal' : d.state === 'flagged' ? 'red' : 'grey'}">${d.state === 'flagged' ? ic('flag', 12, 2.4) : ''}${d.state[0].toUpperCase() + d.state.slice(1)}</span>`;
  return `<div class="page-h"><div><h1>Documents</h1><p class="mut">Every file members attached to an application, oldest first. Open one to view it and verify or flag it.</p></div>${can('docs.verify') ? '' : lockNote('Credit managers and admins verify documents')}</div>
  <div class="toolbar"><div class="chips" role="group" aria-label="Filter documents">${chip('todo', 'To check')}${chip('flagged', 'Flagged')}${chip('verified', 'Verified')}${chip('all', 'All')}</div></div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Document</th><th>Applicant</th><th>Loan</th><th>Sent</th><th>State</th></tr></thead><tbody>${l.length ? l.map(({ a, d }) => `<tr data-href="#/documents/${a.id}" tabindex="0"><td><b>${DOCS[d.k]}</b><small>${FILES[d.k]}${d.note ? ` · <span class="warn">${esc(d.note)}</span>` : ''}</small></td>
    <td>${who(a, 'documents')}</td><td>${PRODUCTS[a.product].n}<small>${peso0(a.amount)}</small></td><td class="tab">${ago(a.submitted)}</td><td>${pill(d)}${isOpen(a) ? '' : ' ' + statusPill(a)}</td></tr>`).join('')
    : `<tr><td colspan="5" class="empty">${UI.df === 'todo' ? 'Nothing to check. Every open application has its documents reviewed.' : 'No documents here.'}</td></tr>`}</tbody></table></div>`;
}
function vReleases() {
  const ready = D.apps.filter(a => a.status === 'approved').sort((a, b) => a.decision.at - b.decision.at);
  const done = D.apps.filter(a => a.status === 'released').sort((a, b) => b.releasedAt - a.releasedAt);
  const net = a => { const k = calc(a); return `<td class="num"><b>${peso(k.net)}</b><small>of ${peso0(a.amount)}</small></td>`; };
  const tr = (a, cells) => `<tr data-href="#/releases/${a.id}" tabindex="0"><td>${who(a, 'releases')}</td><td>${PRODUCTS[a.product].n}<small>${a.term} months</small></td>${net(a)}${cells}</tr>`;
  return `<div class="page-h"><div><h1>Releases</h1><p class="mut">Approved loans waiting for payout, and what has been paid out by GCash or Maya.</p></div>${can('loans.decide') ? '' : lockNote('Credit managers and admins release loans')}</div>
  <h2 class="sub-h">Ready to release <span class="pill ${ready.length ? 'orange' : 'grey'}">${ready.length}</span>${ready.length ? `<small class="mut">${peso(sum(ready, a => calc(a).net))} to send</small>` : ''}</h2>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Member</th><th>Loan</th><th class="num">Net to send</th><th>Send by</th><th>Approved</th></tr></thead><tbody>${ready.length ? ready.map(a => tr(a, `<td>${esc(a.disb)}</td><td class="tab">${ago(a.decision.at)}<small>by ${esc(staff(a.decision.by)?.name || 'former staff')}</small></td>`)).join('')
    : '<tr><td colspan="5" class="empty">Nothing waiting for payout.</td></tr>'}</tbody></table></div>
  <h2 class="sub-h">Released <span class="pill grey">${done.length}</span>${done.length ? `<small class="mut">${peso(sum(done, a => calc(a).net))} sent</small>` : ''}</h2>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Member</th><th>Loan</th><th class="num">Net sent</th><th>Sent by</th><th>Reference</th><th>Released</th></tr></thead><tbody>${done.length ? done.map(a => tr(a, `<td>${esc(a.disb)}</td><td class="tab">${esc(a.releaseRef)}</td><td class="tab">${dfmt(a.releasedAt)}</td>`)).join('')
    : '<tr><td colspan="6" class="empty">No loans released yet.</td></tr>'}</tbody></table></div>`;
}
function vProducts() {
  return `<div class="page-h"><div><h1>Loan products</h1><p class="mut">The rules every application is checked against. They match what members see in the Fundo app.</p></div>${lockNote('Set by the board. Read-only in this prototype')}</div>
  <div class="tbl-wrap"><table class="tbl flat"><thead><tr><th>Loan</th><th>Monthly rate</th><th>Limit</th><th>Co-maker</th><th>Documents needed</th><th class="num">Applications</th></tr></thead><tbody>${Object.entries(PRODUCTS).map(([k, p]) => { const n = D.apps.filter(a => a.product === k), o = n.filter(isOpen).length;
    return `<tr><td><b>${p.n}</b></td><td class="tab">${p.rate}% a month</td><td><span class="tab">${p.mult}×</span> savings and shares<small>up to ${peso0(p.cap)}</small></td><td>${p.co ? 'Required' : 'Not needed'}</td><td>${p.docs.map(d => DOCS[d]).join(', ')}</td><td class="num">${n.length}<small>${o} open</small></td></tr>`; }).join('')}</tbody></table></div>
  <p class="mut" style="margin:14px 4px 0;font-size:13px">Every loan also takes a 1% service fee and a 2% share capital build-up from the amount released.</p>`;
}
function vActivity() {
  const F = { all: () => true, staff: l => l.by, app: l => !l.by }, l = D.log.filter(F[UI.af]);
  const chip = (k, t) => `<button class="chip" data-act="afilter" data-k="${k}" aria-pressed="${UI.af === k}">${t}<span class="c">${D.log.filter(F[k]).length}</span></button>`;
  return `<div class="page-h"><div><h1>Activity</h1><p class="mut">Who did what, newest first. Keeps the last 100 entries in this prototype.</p></div></div>
  <div class="toolbar"><div class="chips" role="group" aria-label="Filter activity">${chip('all', 'All')}${chip('staff', 'By staff')}${chip('app', 'From the Fundo app')}</div></div>
  <section class="card" style="padding-top:0">${l.length ? l.map(logRow).join('') : '<p class="empty">Nothing here yet.</p>'}</section>`;
}
const lockNote = t => `<span class="dr-f lock" style="border:0;padding:0;background:none">${ic('lock', 15)} ${t}</span>`;

/* ---------- side panels ---------- */
function dApp(a) {
  const m = member(a.memberId), k = calc(a), p = k.p, decide = can('loans.decide'), verify = can('docs.verify'), cks = checks(a), blk = blockers(a);
  const lv = { ok: 'check', warn: 'clock', bad: 'x' };
  const doc = d => `<div class="doc"><span class="tile ${d.state === 'verified' ? 't-teal' : d.state === 'flagged' ? 't-red' : 't-blue'}">${ic(d.state === 'verified' ? 'check' : d.state === 'flagged' ? 'flag' : 'doc', 17)}</span>
    <span class="grow"><b style="font-size:14px">${DOCS[d.k]}</b><small>${FILES[d.k]}${d.note ? ` · <span class="warn">${esc(d.note)}</span>` : ''}</small></span>
    <span class="acts"><button class="btn sm ghost" data-act="docView" data-id="${a.id}" data-k="${d.k}">${ic('eye', 15)} View</button>
    ${verify && d.state !== 'verified' && ['new', 'review'].includes(a.status) ? `<button class="btn sm lime" data-act="docVerify" data-id="${a.id}" data-k="${d.k}">Verify</button>` : `<span class="pill ${d.state === 'verified' ? 'teal' : d.state === 'flagged' ? 'red' : 'grey'}">${d.state[0].toUpperCase() + d.state.slice(1)}</span>`}</span></div>`;
  const step = (cls, t, s) => `<li class="${cls}"><span class="d">${ic('check', 13, 3)}</span><div><b>${t}</b><small>${s}</small></div></li>`;
  const dec = a.decision, by = dec && staff(dec.by);
  let foot = '';
  if (!decide && ['new', 'review', 'approved'].includes(a.status)) foot = lockNote('Only credit managers and admins can decide on loans.');
  else if (a.status === 'new') foot = `<span class="spacer"></span><button class="btn dark" data-act="startReview" data-id="${a.id}">Start review</button>`;
  else if (a.status === 'review') foot = `<button class="btn ghost" data-act="askInfo" data-id="${a.id}">${ic('msg', 16)} Ask for info</button><span class="spacer"></span><button class="btn ghost red" data-act="reject" data-id="${a.id}">Reject</button><button class="btn lime" data-act="approve" data-id="${a.id}" ${blk.length ? `disabled title="First ${blk.join(' and ')}"` : ''}>${ic('check', 16, 2.4)} Approve</button>`;
  else if (a.status === 'approved') foot = `<span class="mut" style="font-size:13px">Member signs the disclosure in the app, then release.</span><span class="spacer"></span><button class="btn dark" data-act="release" data-id="${a.id}">${ic('wallet', 16)} Mark as released</button>`;
  return `<div class="dr-h"><span class="av lg">${initials(full(m))}</span><div class="grow"><h2 id="drTitle">${esc(full(m))}</h2><p>${esc(m.no)} · ${a.id} · ${p.n}</p><div style="margin-top:8px">${statusPill(a)}</div></div><button class="ib" data-act="closeLayer" aria-label="Close">${ic('x', 20)}</button></div>
  <div class="dr-b">
    <div class="sum"><div class="l">Requested in the app ${ago(a.submitted)}</div><div class="a">${peso(a.amount)}</div><div class="s">${a.term} months · ${peso(k.mo)} a month at ${p.rate}% · member receives ${peso(k.net)}</div></div>
    ${a.status === 'review' && blk.length && decide ? `<p class="mut" style="margin:10px 2px 0;font-size:13px">To approve: ${blk.join(' and ')}.</p>` : ''}
    <div class="sec"><h3>Credit checks</h3><div class="box">${cks.map(c => `<div class="ck"><span class="st ${c[2]}">${ic(lv[c[2]], 13, 3)}</span><div class="grow"><b>${c[0]}</b><small>${esc(c[1])}</small>${c[3] && decide && ['new', 'review'].includes(a.status) ? `<button class="btn sm ghost" data-act="comakerOk" data-id="${a.id}">Mark co-maker as confirmed</button>` : ''}</div></div>`).join('')}</div></div>
    <div class="sec"><h3>Documents</h3><div class="box">${a.docs.map(doc).join('')}</div></div>
    <div class="sec"><h3>Request</h3><div class="kv">
      <div><span>Purpose</span><b>${esc(a.purpose)}</b></div><div><span>Release to</span><b>${esc(a.disb)}</b></div>
      <div><span>Take-home pay</span><b>${peso0(a.income)}/mo</b></div><div><span>Total to repay</span><b>${peso(k.total)}</b></div>
      <div><span>Service fee (1%)</span><b>${peso(k.fee)}</b></div><div><span>Share capital build-up (2%)</span><b>${peso(k.cbu)}</b></div>
      <div><span>Savings</span><b>${peso(m.sav)}</b></div><div><span>Share capital</span><b>${peso(m.paid)}</b></div></div></div>
    <div class="sec"><h3>Progress</h3><ol class="trk">
      ${step('done', 'Sent from the Fundo app', dfmt(a.submitted) + ' · ' + ago(a.submitted))}
      ${step(a.reviewAt ? 'done' : 'now', 'Review', a.reviewAt ? `Started by ${esc(staff(a.reviewBy)?.name || 'staff')} · ${ago(a.reviewAt)}` : 'Not started')}
      ${step(dec ? 'done' : a.reviewAt ? 'now' : '', dec ? (dec.kind === 'approved' ? 'Approved' : 'Rejected') : 'Decision', dec ? `${esc(by?.name || 'Staff')} · ${ago(dec.at)}` : 'Credit committee')}
      ${dec?.kind === 'rejected' ? '' : step(a.releasedAt ? 'done' : dec ? 'now' : '', 'Released', a.releasedAt ? `${peso(k.net)} to ${esc(a.disb)} · ref ${esc(a.releaseRef)} · ${ago(a.releasedAt)}` : 'After the member signs')}</ol>
      ${dec?.kind === 'rejected' ? `<div class="decision no"><b>${esc(dec.reason)}</b>${dec.note ? `<br>Message to the member: “${esc(dec.note)}”` : ''}</div>` : dec?.note ? `<div class="decision ok">${esc(dec.note)}</div>` : ''}</div>
    <div class="sec"><h3>Notes</h3><div class="notes">${a.notes.length ? a.notes.map(n => { const s = staff(n.by); return `<div class="note">${sav(s)}<div><small><b>${esc(s?.name || 'Staff')}</b> · ${ago(n.at)}</small><p>${esc(n.text)}</p></div></div>`; }).join('') : '<p class="mut" style="margin:0;font-size:13px">No notes yet. Notes are for staff only; members don\'t see them.</p>'}
      <div class="fld"><label for="noteIn" class="sr">Add a note</label><textarea id="noteIn" class="in" placeholder="Add a note for the credit committee"></textarea></div>
      <div><button class="btn sm ghost" data-act="addNote" data-id="${a.id}">Add note</button></div></div></div>
  </div>${foot ? `<div class="dr-f">${foot}</div>` : ''}`;
}
function dMember(m) {
  const apps = D.apps.filter(a => a.memberId === m.id).sort((a, b) => b.submitted - a.submitted), edit = can('members.edit');
  return `<div class="dr-h"><span class="av lg">${initials(full(m))}</span><div class="grow"><h2 id="drTitle">${esc(full(m))}</h2><p>${esc(m.no)} · ${esc(m.type)} member · accepted ${dfmt(day(m.accepted))}</p><div style="margin-top:8px">${m.status === 'Active' ? '<span class="pill teal">Active</span>' : '<span class="pill grey">Inactive</span>'}${m.pmes ? ' <span class="pill grey">Seminar attended</span>' : ' <span class="pill orange">Seminar pending</span>'}</div></div><button class="ib" data-act="closeLayer" aria-label="Close">${ic('x', 20)}</button></div>
  <div class="dr-b">
    <div class="sum"><div class="l">Share capital paid up</div><div class="a">${peso(m.paid)}</div><div class="s">${Math.round(m.sub / 100)} shares subscribed (${peso0(m.sub)}) · savings ${peso(m.sav)} · ${m.onTime} on-time payments</div></div>
    <div class="sec"><h3>Record</h3><div class="kv">
      <div><span>Mobile</span><b>${esc(m.mobile)}</b></div><div><span>TIN</span><b>${esc(m.tin ? m.tin.replace(/\d(?=.*\d{3})/g, '•') : '—')}</b></div>
      <div><span>City or municipality</span><b>${esc(m.city)}</b></div><div><span>BOD resolution no.</span><b>${esc(m.res)}</b></div>
      <div><span>Date accepted</span><b>${dfmt(day(m.accepted))}</b></div><div><span>Borrowing limit (Salary Loan)</span><b>${peso0(Math.min(150000, (m.paid + m.sav) * 8))}</b></div></div></div>
    <div class="sec"><h3>Loan applications</h3><div class="box">${apps.length ? apps.map(a => `<a class="lrow" href="#/loans/${a.id}"><span class="tile t-orange">${ic('card', 17)}</span><span class="grow"><b>${PRODUCTS[a.product].n} · ${peso0(a.amount)}</b><small>${a.id} · sent ${ago(a.submitted)}</small></span>${statusPill(a)}</a>`).join('') : '<p class="empty">No applications yet.</p>'}</div></div>
  </div>
  <div class="dr-f">${edit ? `<button class="btn ghost" data-act="memberEdit" data-id="${m.id}">${ic('edit', 16)} Edit</button><button class="btn ghost" data-act="memberToggle" data-id="${m.id}">${ic(m.status === 'Active' ? 'pause' : 'refresh', 16)} ${m.status === 'Active' ? 'Deactivate' : 'Reactivate'}</button>` : lockNote('Only membership officers and admins edit records.')}
  <span class="spacer"></span>${can('members.delete') ? `<button class="btn ghost red" data-act="memberDelete" data-id="${m.id}">${ic('trash', 16)} Delete</button>` : ''}</div>`;
}

/* ---------- shell + render ---------- */
const root = $('#root');
let lastView = '', drawerKey = '', drawerFocus = null, modalFocus = null, modalSubmit = null;
/* Front door: a staff sign-in, same pattern as the member app's lime welcome + plain sign-in screen. */
function signinView() {
  drawerKey = ''; lastView = '';
  root.innerHTML = `<div class="signin">
  <aside class="si-brand"><video class="si-vid" muted loop playsinline aria-hidden="true"></video><i class="si-glow" aria-hidden="true"></i>
    <div class="si-top"><div class="si-mark">${logo(64)}</div><span class="si-clock tab" id="siClock"></span></div><span class="wm" aria-hidden="true">${logo(420, '#191C15', '#191C15')}</span>
    <div><div class="si-wm">fundo <span>admin</span></div><p>Loan desk for co-op staff.</p></div></aside>
  <main class="si-main"><div class="si-card" id="siCard">${UI.ob ? obCard() : siCard()}</div><footer class="si-foot">© ${new Date().getFullYear()} Fundo</footer></main></div>`;
  document.title = 'Sign in · Fundo Admin';
  const still = matchMedia('(prefers-reduced-motion:reduce)').matches, brand = $('.si-brand');
  // clock; the timer stops itself once the sign-in screen is gone
  const clock = () => { const c = $('#siClock'); if (!c) return clearInterval(timer); c.textContent = new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };
  const timer = setInterval(clock, 15000); clock();
  if (!still) {
    brand.addEventListener('pointermove', e => { const r = brand.getBoundingClientRect(); brand.style.setProperty('--mx', e.clientX - r.left + 'px'); brand.style.setProperty('--my', e.clientY - r.top + 'px'); });
  }
  // background video: desk widths only (phones get the short lime header); the lime panel stays if media/signin.mp4 is missing
  const v = $('.si-vid');
  if (matchMedia('(min-width:761px)').matches) {
    v.addEventListener('loadeddata', () => brand.classList.add('has-vid'));
    v.autoplay = !still; // reduced motion: still first frame
    v.src = 'media/signin.mp4';
  }
}
const coopAbbr = () => D.coop.sh.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
function siCard() {
  return `<header class="si-box">
    <h1>Sign in</h1><p class="mut">Choose your staff account. What you can do depends on your role.</p></header>
    <div class="si-box">
      <div class="si-list">${D.staff.map(s => `<button class="si-acct" data-act="signin" data-id="${s.id}">${sav(s)}<span class="grow"><b>${esc(s.name)}${s.id === D.last ? ' <span class="pill grey">Last used</span>' : ''}${s.fresh ? ' <span class="pill lime">New</span>' : ''}</b><small>${esc(s.title === ROLES[s.role].n ? s.title : s.title + ' · ' + ROLES[s.role].n)}</small></span>${ic('chev', 18)}</button>`).join('')}</div>
    </div>
    <div class="si-box si-new"><span class="grow"><b>New to Fundo Admin?</b><small>Set up your co-op, or join one you were invited to.</small></span><button class="btn si-btn ghost" data-act="obGo" data-step="role">Get started ${ic('chev', 16, 2.2)}</button></div>`;
}

/* ---------- first-time setup: a co-op manager creates the workspace, invited staff join it ---------- */
const OB_STEPS = { you: [1, 3], coop: [2, 3], team: [3, 3], join: [1, 2], joinme: [2, 2] };
const obFld = (name, label, extra = '', hint = '', type = 'text') => fld(name, label, UI.ob.d[name] || '', type, 'autocomplete="off" ' + extra, hint);
function obCard() {
  const o = UI.ob, d = o.d, st = OB_STEPS[o.step];
  const head = (h, p, back) => `<div class="ob-top"><button type="button" class="ob-back" data-act="obGo" data-step="${back}">${ic('back', 16, 2.2)} Back</button>${st ? `<span class="tab mut">Step ${st[0]} of ${st[1]}</span>` : ''}</div>
    ${st ? `<div class="ob-prog" aria-hidden="true">${Array.from({ length: st[1] }, (_, i) => `<i class="${i < st[0] ? 'on' : ''}"></i>`).join('')}</div>` : ''}
    <h1>${h}</h1><p class="mut">${p}</p>`;
  const next = (label, icon = 'chev') => `<button class="btn si-btn dark" type="submit">${label} ${ic(icon, 16, 2.2)}</button>`;
  const form = body => `<form class="ob-form" id="obForm" data-step="${o.step}" novalidate>${body}</form>`;
  if (o.step === 'role') return `<header>${head('Get started', 'Tell us how you\'re joining Fundo Admin.', 'signin')}</header>
    <div class="si-list ob-roles">
      <button class="si-acct" data-act="obGo" data-step="you"><span class="tile t-lime">${ic('shield', 18)}</span><span class="grow"><b>I'm setting up our co-op</b><small>For the co-op manager or admin. You'll add your co-op's details and invite your team.</small></span>${ic('chev', 18)}</button>
      <button class="si-acct" data-act="obGo" data-step="join"><span class="tile t-blue">${ic('users', 18)}</span><span class="grow"><b>I was invited by my co-op</b><small>For credit managers, membership officers and other staff. Use the email your admin invited.</small></span>${ic('chev', 18)}</button>
    </div>
    <p class="si-note">${ic('lock', 14)}<span>Prototype: accounts are saved in this browser only.</span></p>`;
  if (o.step === 'you') return form(`${head('About you', 'You\'ll be the co-op admin: you can decide loans, edit members and manage staff.', 'role')}
    ${obFld('name', 'Full name', 'autofocus')}${obFld('email', 'Work email', '', 'Your co-op email, not a personal one if you have it.', 'email')}${obFld('title', 'Position', 'placeholder="e.g. General manager"')}${next('Continue')}`);
  if (o.step === 'coop') return form(`${head('Your co-op', 'This is what your staff see when they sign in.', 'you')}
    ${obFld('coop', 'Registered name', 'placeholder="e.g. San Isidro Multi-Purpose Cooperative" autofocus', 'As written on your CDA registration.')}
    <div class="grid2">${obFld('sh', 'Short name', 'placeholder="e.g. San Isidro MPC"')}${obFld('city', 'City or municipality', 'placeholder="e.g. Iloilo City"')}</div>${next('Continue')}`);
  if (o.step === 'team') return form(`${head('Invite your team', 'Optional. Add the staff who review loans and keep member records. You can do this later in Staff and roles.', 'coop')}
    ${[0, 1, 2].map(i => `<div class="ob-inv${i ? ' more' : ''}">${fld('inv' + i, i ? `Staff email ${i + 1}` : 'Staff email', d['inv' + i] || '', 'email', 'autocomplete="off" placeholder="name@yourcoop.coop"')}
      <div class="fld"><label for="f-r${i}">Role</label><select class="in" id="f-r${i}" name="r${i}">${['credit', 'officer', 'admin'].map(r => `<option value="${r}" ${(d['r' + i] || 'credit') === r ? 'selected' : ''}>${ROLES[r].n}</option>`).join('')}</select></div></div>`).join('')}
    ${next('Create workspace', 'check')}`);
  if (o.step === 'join') return form(`${head('Join your co-op', 'Enter the work email your co-op admin invited.', 'role')}
    ${obFld('email', 'Work email', 'autofocus', '', 'email')}${next('Continue')}`);
  if (o.step === 'joinme') { const s = staff(d.sid); return form(`${head('Confirm your details', `You've been added to your co-op as <b>${ROLES[s.role].n}</b>.`, 'join')}
    ${obFld('name', 'Full name', 'autofocus')}${obFld('title', 'Position', 'placeholder="e.g. Loan officer"')}
    <div class="ob-can"><b>As ${ROLES[s.role].n} you can</b><ul>${PERMS.filter(p => p[0] === 'view' || ROLES[s.role].can.includes(p[0])).map(p => `<li>${ic('check', 15, 2.6)}${p[1]}</li>`).join('')}</ul></div>
    ${next('Go to my dashboard')}`); }
  return '';
}
function obSubmit(f) {
  const o = UI.ob, fd = new FormData(f), v = k => String(fd.get(k) ?? '').trim(); let bad = false;
  const err = (k, m) => { fieldErr(f, k, m); bad = true; };
  const okMail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  for (const [k, x] of fd) o.d[k] = String(x).trim();
  if (o.step === 'you') {
    if (v('name').length < 3) err('name', 'Enter your full name');
    if (!okMail(v('email'))) err('email', 'Enter a valid email');
    if (!bad) return obWait(() => obTo('coop'));
  } else if (o.step === 'coop') {
    if (v('coop').length < 5) err('coop', 'Enter your co-op\'s registered name');
    if (!v('sh')) err('sh', 'Required'); if (!v('city')) err('city', 'Required');
    if (!bad) return obWait(() => obTo('team'));
  } else if (o.step === 'team') {
    const seen = new Set([o.d.email.toLowerCase()]);
    [0, 1, 2].forEach(i => { const e = v('inv' + i).toLowerCase(); if (!e) return; if (!okMail(e)) err('inv' + i, 'Enter a valid email'); else if (seen.has(e)) err('inv' + i, 'Already on the list'); seen.add(e); });
    if (!bad) return obCreate();
  } else if (o.step === 'join') {
    const s = D.staff.find(x => x.email.toLowerCase() === v('email').toLowerCase());
    if (!okMail(v('email'))) err('email', 'Enter a valid email');
    else if (!s) err('email', `No invite for this email. Ask your co-op admin to invite you from Staff and roles.`);
    if (!bad) { Object.assign(o.d, { sid: s.id, name: s.name, title: s.title === 'Staff' ? '' : s.title }); return obWait(() => obTo('joinme')); }
  } else if (o.step === 'joinme') {
    if (v('name').length < 3) err('name', 'Enter your full name');
    if (!bad) { const s = staff(o.d.sid); Object.assign(s, { name: v('name'), title: v('title') || s.title, fresh: true }); D.me = D.last = s.id; log('joined Fundo Admin', '#/staff'); return obDone(); }
  }
  f.querySelector('.bad')?.focus();
}
function obCreate() {
  const d = UI.ob.d, id = 's' + now();
  // shortcut: sample members and loans stay so a new co-op has something to try; a real signup starts empty and imports its registry.
  D.coop = { n: d.coop, sh: d.sh, city: d.city, pre: (d.sh.match(/\b[A-Za-z]/g) || ['C']).join('').slice(0, 3).toUpperCase() };
  D.staff = [{ id, name: d.name, email: d.email, title: d.title || 'Co-op manager', role: 'admin', fresh: true },
    ...[0, 1, 2].filter(i => d['inv' + i]).map(i => ({ id: id + '-' + i, name: d['inv' + i].split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), email: d['inv' + i], title: 'Staff', role: d['r' + i] }))];
  D.me = D.last = id; D.log = [];
  log(`set up ${d.sh} on Fundo Admin`, '#/staff');
  D.staff.slice(1).forEach(s => log(`invited ${s.name} as ${ROLES[s.role].n}`, '#/staff'));
  obDone();
}
function obDone() { save(); obWait(() => { UI.ob = null; location.hash = '#/overview'; render(); }, 'Setting up your dashboard…', 1100); }
// skeleton of the next step while it "loads"; shortcut: fixed delay stands in for a real request, swap for the API call when there is one
function obWait(fn, msg = '', ms = 650) {
  const c = $('#siCard'), bar = (w, h = 14) => `<i class="sk" style="width:${w};height:${h}px"></i>`;
  c.innerHTML = `<div class="sk-wrap" role="status" aria-live="polite"><span class="sr">${msg || 'Loading the next step…'}</span>
    <div class="sk-row">${bar('64px')}${bar('72px')}</div>${bar('100%', 4)}${bar('55%', 30)}${bar('85%')}
    ${[0, 1].map(() => `<div class="sk-fld">${bar('90px', 12)}${bar('100%', 50)}</div>`).join('')}${bar('100%', 50)}
    ${msg ? `<p class="sk-msg">${msg}</p>` : ''}</div>`;
  setTimeout(fn, ms);
}
function obTo(step) {
  UI.ob = step === 'signin' ? null : { step, d: UI.ob?.d || {} };
  const c = $('#siCard'); c.innerHTML = UI.ob ? obCard() : siCard();
  ($('[autofocus]', c) || $('h1', c))?.focus({ preventScroll: true });
}

/* first sign-in: a short, role-aware checklist on the overview, dismissed once */
function welcomeCard() {
  const u = me(); if (!u.fresh) return '';
  const r = u.role, steps = [
    r === 'admin' && ['shield', 'Invite your staff and set their roles', '#/staff'],
    r !== 'officer' && ['inbox', 'Open the loan queue and decide your first application', '#/loans'],
    r !== 'officer' && ['doc', 'Check documents members sent with their applications', '#/documents'],
    ['users', r === 'credit' ? 'Look up a member\'s shares and loan history' : 'Add or update member records', '#/members'],
    ['card', 'Read your co-op\'s loan product rules', '#/products']
  ].filter(Boolean);
  return `<section class="card welcome" aria-labelledby="wcH"><div class="ghd"><h2 id="wcH">Welcome to Fundo Admin, ${esc(u.name.split(' ')[0])}</h2><button class="lnk" data-act="obDismiss">Got it, hide this</button></div>
    <p class="mut">You're signed in as <b>${ROLES[r].n}</b>${D.staff.length > 1 ? '' : '. You\'re the only staff account so far'}. Here's where to start. The sample members and applications are there to practice on.</p>
    <div class="wc-steps">${steps.map((s, i) => `<a href="${s[2]}" class="wc-step"><span class="tile t-lime">${ic(s[0], 17)}</span><span><small>${i + 1}</small>${s[1]}</span></a>`).join('')}</div></section>`;
}

function shell() {
  let mini = false; try { mini = localStorage.getItem('fundo-admin-side') === 'mini'; } catch (e) { }
  root.innerHTML = `<div class="app${mini ? ' mini' : ''}"><aside class="side" id="side">${brand()}
    <div class="side-coop"><span class="cb" aria-hidden="true">${esc(coopAbbr())}</span><span><b>${esc(D.coop.sh)}</b><small>${esc(D.coop.city)} · Admin</small></span></div>
    <nav class="nav" id="nav" aria-label="Main"></nav><div class="side-me" id="sideMe"></div></aside>
    <div class="main-wrap"><header class="top"><button class="ib side-t" data-act="toggleSide" aria-controls="side" aria-expanded="${!mini}" aria-label="${mini ? 'Expand' : 'Collapse'} sidebar" title="${mini ? 'Expand' : 'Collapse'} sidebar">${ic('side', 19)}</button><span class="crumb" id="crumb"></span></header><main class="main" id="main"></main></div></div>
  <div class="scrim" id="scrim" data-act="closeLayer"></div>
  <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drTitle" hidden></aside>
  <div class="modal-wrap" id="modalWrap" hidden><div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mdTitle"></div></div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}
const VIEWS = { overview: ['Overview', vOverview], loans: ['Loan applications', vLoans], documents: ['Documents', vDocuments], releases: ['Releases', vReleases], members: ['Members', vMembers], products: ['Loan products', vProducts], activity: ['Activity', vActivity], staff: ['Staff and roles', vStaff] };
function render() {
  if (!me()) { signinView(); return; }
  if (!$('#nav')) shell();
  let [, view, id] = location.hash.split('/');
  if (!VIEWS[view] || (view === 'staff' && !can('staff.manage'))) view = 'overview';
  const w = waiting().length, u = me();
  $('#nav').innerHTML = [['overview', 'grid', 'Overview'], ['loans', 'inbox', 'Loan applications', w], ['documents', 'doc', 'Documents'], ['releases', 'wallet', 'Releases'], ['members', 'users', 'Members'], ['products', 'card', 'Loan products'], ['activity', 'clock', 'Activity'], ...(can('staff.manage') ? [['staff', 'shield', 'Staff and roles']] : [])]
    .map(n => `<a href="#/${n[0]}" title="${n[2]}" ${n[0] === view ? 'aria-current="page"' : ''}>${ic(n[1], 19)}<span class="nl">${n[2]}</span>${n[3] ? `<span class="cnt" aria-label="${n[3]} waiting">${n[3]}</span>` : ''}</a>`).join('');
  $('#sideMe').innerHTML = `<div class="row">${sav(u)}<span class="grow who"><b>${esc(u.name)}</b><small>${ROLES[u.role].n}</small></span>
    <span class="acts"><button class="ib" data-act="signout" title="Switch account" aria-label="Switch account">${ic('logout', 17)}</button><button class="ib" data-act="resetDemo" title="Reset sample data" aria-label="Reset sample data">${ic('refresh', 17)}</button></span></div>`;
  $('#crumb').textContent = VIEWS[view][0];
  $('#main').innerHTML = VIEWS[view][1]();
  if (view !== lastView) { window.scrollTo(0, 0); lastView = view; }
  document.title = VIEWS[view][0] + ' · Fundo Admin';
  let html = '', key = '';
  if (id && ['loans', 'documents', 'releases'].includes(view) && app(id)) { html = dApp(app(id)); key = 'a' + id; }
  else if (id && view === 'members' && member(id)) { html = dMember(member(id)); key = 'm' + id; }
  syncDrawer(html, key);
}
function syncDrawer(html, key) {
  const dr = $('#drawer'), sc = $('#scrim');
  if (html) {
    const keep = key === drawerKey ? $('.dr-b', dr)?.scrollTop || 0 : 0, note = $('#noteIn', dr)?.value || '';
    dr.innerHTML = html;
    if (keep) $('.dr-b', dr).scrollTop = keep;
    if (key === drawerKey && note && $('#noteIn', dr)) $('#noteIn', dr).value = note;
    if (dr.hidden) {
      drawerFocus = document.activeElement; dr.hidden = false; void dr.offsetWidth; dr.classList.add('on'); sc.classList.add('on');
      setTimeout(() => $('[data-act=closeLayer]', dr)?.focus({ preventScroll: true }), 60);
    }
    drawerKey = key;
  } else if (!dr.hidden) {
    dr.classList.remove('on'); sc.classList.remove('on'); drawerKey = '';
    setTimeout(() => { if (!dr.classList.contains('on')) dr.hidden = true; }, 320);
    if (drawerFocus && drawerFocus.isConnected) drawerFocus.focus({ preventScroll: true });
  }
}
function commit(msg) { save(); render(); if (msg) toast(msg); }
let tt; function toast(m) { const t = $('#toast'); if (!t) return; t.innerHTML = ic('check', 18, 2.4) + '<span>' + esc(m) + '</span>'; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 3200); }

/* ---------- modal ---------- */
function openModal(title, body, opts = {}) {
  const w = $('#modalWrap'), md = $('#modal');
  modalFocus = document.activeElement; modalSubmit = opts.onSubmit || null;
  md.className = 'modal' + (opts.wide ? ' wide' : '');
  md.innerHTML = `<form id="mdForm" novalidate><div class="md-h"><h2 id="mdTitle">${title}</h2><button type="button" class="ib" data-act="closeModal" aria-label="Close">${ic('x', 20)}</button></div>
    <div class="md-b">${body}</div>${opts.foot ?? (modalSubmit ? `<div class="md-f"><button type="button" class="btn ghost" data-act="closeModal">Cancel</button><button class="btn ${opts.danger ? 'red' : 'dark'}" type="submit">${opts.submit || 'Save'}</button></div>` : '')}</form>`;
  w.hidden = false; void w.offsetWidth; w.classList.add('on');
  setTimeout(() => ($('.md-b input:not([type=hidden]),.md-b textarea,.md-b select', md) || $('.md-f .btn:last-child', md) || $('.ib', md))?.focus(), 40);
}
function closeModal() {
  const w = $('#modalWrap'); if (!w || w.hidden) return;
  w.classList.remove('on'); modalSubmit = null;
  setTimeout(() => { if (!w.classList.contains('on')) w.hidden = true; }, 200);
  if (modalFocus && modalFocus.isConnected) modalFocus.focus({ preventScroll: true });
}
function fieldErr(form, name, msg) { const el = form.elements[name]; if (!el) return; el.classList.add('bad'); el.setAttribute('aria-invalid', 'true'); const f = el.closest('.fld'); if (f && !$('.err', f)) f.insertAdjacentHTML('beforeend', `<small class="err">${esc(msg)}</small>`); }
const fld = (name, label, value = '', type = 'text', extra = '', hint = '') => `<div class="fld"><label for="f-${name}">${label}</label><input class="in" id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}>${hint ? `<small>${hint}</small>` : ''}</div>`;

/* ---------- actions ---------- */
const A = {
  obGo: el => obTo(el.dataset.step),
  obDismiss: () => { delete me().fresh; commit(); },
  signin: el => { D.me = D.last = el.dataset.id; save(); location.hash = '#/overview'; render(); },
  toggleSide: () => {
    const mini = $('.app').classList.toggle('mini'), b = $('.side-t'), l = (mini ? 'Expand' : 'Collapse') + ' sidebar';
    b.setAttribute('aria-expanded', !mini); b.setAttribute('aria-label', l); b.title = l;
    try { localStorage.setItem('fundo-admin-side', mini ? 'mini' : ''); } catch (e) { }
  },
  signout: () => { D.me = null; UI.ob = null; save(); history.replaceState(null, '', location.pathname); render(); },
  resetDemo: () => openModal('Reset sample data?', '<p>This puts back the sample members and applications and clears changes made in this browser.</p>', { submit: 'Reset', danger: true, onSubmit: () => { const keep = D.me; D = seed(); D.me = keep; commit('Sample data reset'); } }),
  closeLayer: () => { if (!$('#modalWrap').hidden) { closeModal(); return; } const [, v] = location.hash.split('/'); location.hash = '#/' + (v || 'overview'); },
  closeModal: () => closeModal(),
  lfilter: el => { UI.lf = el.dataset.k; render(); },
  mfilter: el => { UI.mf = el.dataset.k; render(); },
  dfilter: el => { UI.df = el.dataset.k; render(); },
  afilter: el => { UI.af = el.dataset.k; render(); },

  startReview: el => { const a = app(el.dataset.id); a.status = 'review'; a.reviewAt = now(); a.reviewBy = D.me; log(`started reviewing ${full(member(a.memberId))}'s ${PRODUCTS[a.product].n}`, '#/loans/' + a.id); commit('Review started'); },
  docVerify: el => { const a = app(el.dataset.id), d = a.docs.find(x => x.k === el.dataset.k); d.state = 'verified'; d.note = ''; log(`verified the ${DOCS[d.k].toLowerCase()} for ${full(member(a.memberId))}`, '#/loans/' + a.id); closeModal(); commit(DOCS[d.k] + ' verified'); },
  docFlag: el => {
    const a = app(el.dataset.id), d = a.docs.find(x => x.k === el.dataset.k);
    openModal('Flag ' + DOCS[d.k].toLowerCase(), `<p class="mut">Say what's wrong. ${esc(member(a.memberId).first)} is asked to upload it again in the app.</p><div class="fld"><label for="f-why">What's wrong</label><textarea class="in" id="f-why" name="why" placeholder="e.g. The photo is blurry and the ID number can't be read"></textarea></div>`,
      { submit: 'Flag document', danger: true, onSubmit: (fd, f) => { const why = String(fd.get('why')).trim(); if (!why) { fieldErr(f, 'why', 'Add a short reason'); return false; } d.state = 'flagged'; d.note = why; a.waiting = true; log(`flagged the ${DOCS[d.k].toLowerCase()} for ${full(member(a.memberId))}`, '#/loans/' + a.id); commit('Flagged · member asked to re-upload'); } });
  },
  docView: el => {
    const a = app(el.dataset.id), d = a.docs.find(x => x.k === el.dataset.k), m = member(a.memberId), n = full(m);
    const rows = { id: [['Name', n], ['ID', 'PhilSys National ID'], ['ID number', '•••• •••• •••• ' + m.no.slice(-4)], ['Address', m.city]], pay: [['Employee', n], ['Pay period', 'Oct 1–31, 2026'], ['Net pay', peso(a.income)], ['Employer', 'DepEd Division of Cebu City']], coe: [['Employee', n], ['Position', 'Teacher I'], ['Employed since', 'June 2017'], ['Status', 'Permanent']], proof: [['Patient', n], ['Facility', 'Vicente Sotto Memorial Medical Center'], ['Bill', peso(a.amount * 1.15)], ['Date', 'Oct 29, 2026']], permit: [['Owner', n], ['Business', m.last + ' Sari-sari Store'], ['Barangay', 'Talamban, Cebu City'], ['Valid until', 'Dec 31, 2026']], biz: [['Owner', n], ['Photo', 'Store front, 1 of 1'], ['Taken', 'Oct 28, 2026'], ['Location', m.city]] }[d.k];
    const ok = can('docs.verify') && d.state !== 'verified' && ['new', 'review'].includes(a.status);
    openModal(DOCS[d.k], `${d.state === 'flagged' ? `<div class="flagnote">Flagged: ${esc(d.note)}</div>` : ''}<div class="paper"><div class="ph"><b>${DOCS[d.k]}</b><span class="mut">${FILES[d.k]}</span></div>${rows.map(r => `<div class="pr"><span>${r[0]}</span><b>${esc(r[1])}</b></div>`).join('')}<div class="pf">Uploaded from the Fundo app ${ago(a.submitted)} · matched to ${esc(m.no)}</div></div>`,
      { wide: true, foot: `<div class="md-f">${ok ? `<button type="button" class="btn ghost red" data-act="docFlag" data-id="${a.id}" data-k="${d.k}">${ic('flag', 16)} Flag</button><button type="button" class="btn lime" data-act="docVerify" data-id="${a.id}" data-k="${d.k}">${ic('check', 16, 2.4)} Verify</button>` : `<button type="button" class="btn ghost" data-act="closeModal">Close</button>`}</div>` });
  },
  comakerOk: el => { const a = app(el.dataset.id); a.comaker.confirmed = true; log(`confirmed ${a.comaker.name} as co-maker for ${full(member(a.memberId))}`, '#/loans/' + a.id); commit('Co-maker confirmed'); },
  addNote: el => { const a = app(el.dataset.id), t = $('#noteIn').value.trim(); if (!t) { $('#noteIn').focus(); return; } a.notes.push({ by: D.me, at: now(), text: t }); $('#noteIn').value = ''; log(`added a note to ${full(member(a.memberId))}'s ${PRODUCTS[a.product].n}`, '#/loans/' + a.id); commit('Note added'); },
  askInfo: el => {
    const a = app(el.dataset.id), m = member(a.memberId), miss = a.docs.filter(d => d.state !== 'verified').map(d => DOCS[d.k].toLowerCase());
    openModal('Ask ' + esc(m.first) + ' for information', `<p class="mut">Sent to ${esc(m.first)} as a Fundo notification and a text to ${esc(m.mobile)}.</p><div class="fld"><label for="f-msg">Message</label><textarea class="in" id="f-msg" name="msg">${esc(`Hi ${m.first}, to continue your ${PRODUCTS[a.product].n} we need ${miss.length ? 'a clearer copy of your ' + miss.join(' and ') : 'a few more details'}. You can upload it in the Fundo app. Thank you!`)}</textarea></div>`,
      { submit: ic('send', 15) + ' Send', onSubmit: (fd, f) => { const msg = String(fd.get('msg')).trim(); if (!msg) { fieldErr(f, 'msg', 'Write a message'); return false; } a.waiting = true; a.notes.push({ by: D.me, at: now(), text: 'Asked the member: ' + msg }); log(`asked ${full(m)} for more information`, '#/loans/' + a.id); commit('Sent to ' + m.first + ' in the app'); } });
  },
  approve: el => {
    const a = app(el.dataset.id), m = member(a.memberId), k = calc(a), risky = checks(a).filter(c => c[2] !== 'ok');
    if (blockers(a).length) return;
    openModal('Approve this loan?', `<div class="kv"><div><span>Member</span><b>${esc(full(m))}</b></div><div><span>Loan</span><b>${PRODUCTS[a.product].n}</b></div><div><span>Amount</span><b>${peso(a.amount)}</b></div><div><span>Monthly</span><b>${peso(k.mo)} × ${a.term}</b></div><div><span>Member receives</span><b>${peso(k.net)}</b></div><div><span>Release to</span><b>${esc(a.disb)}</b></div></div>
      ${risky.length ? `<label class="check"><input type="checkbox" name="ok"><span>I reviewed the flagged checks: ${risky.map(r => '<b>' + r[0].toLowerCase() + '</b>').join(', ')}. The credit committee accepts the risk.</span></label>` : ''}
      <div class="fld"><label for="f-note">Note for the record <span class="mut" style="font-weight:400">(optional)</span></label><textarea class="in" id="f-note" name="note" placeholder="e.g. Approved at the Nov 7 committee meeting"></textarea></div>`,
      { submit: 'Approve ' + peso0(a.amount), onSubmit: (fd, f) => { if (risky.length && !fd.get('ok')) { f.elements.ok.closest('.check').style.boxShadow = 'inset 0 0 0 1.5px var(--red)'; return false; } a.status = 'approved'; a.waiting = false; a.decision = { by: D.me, at: now(), kind: 'approved', note: String(fd.get('note') || '').trim() }; log(`approved ${full(m)}'s ${peso0(a.amount)} ${PRODUCTS[a.product].n}`, '#/loans/' + a.id); commit(`Approved · ${m.first} can sign in the app now`); } });
  },
  reject: el => {
    const a = app(el.dataset.id), m = member(a.memberId);
    const reasons = ['Over the borrowing limit', 'Payment is too high for the income', 'Co-maker is not in good standing', 'Documents could not be verified', 'Past-due loans on record', 'Other'];
    openModal('Reject this application?', `<fieldset style="border:0;margin:0;padding:0" class="fld"><legend class="lb" style="margin-bottom:6px">Reason</legend><div class="radios">${reasons.map((r, i) => `<label><input type="radio" name="reason" value="${r}" ${i === 0 ? 'checked' : ''}> ${r}</label>`).join('')}</div></fieldset>
      <div class="fld"><label for="f-note">Message to ${esc(m.first)}</label><textarea class="in" id="f-note" name="note">${esc(`Hi ${m.first}, we can't approve this ${PRODUCTS[a.product].n} right now. Visit the branch or reply here and we'll help you find an amount that fits.`)}</textarea><small>Shown in the Fundo app with the reason.</small></div>`,
      { submit: 'Reject application', danger: true, onSubmit: (fd, f) => { const note = String(fd.get('note')).trim(); if (!note) { fieldErr(f, 'note', 'Tell the member what to do next'); return false; } a.status = 'rejected'; a.waiting = false; a.decision = { by: D.me, at: now(), kind: 'rejected', reason: String(fd.get('reason')), note }; log(`rejected ${full(m)}'s ${PRODUCTS[a.product].n}`, '#/loans/' + a.id); commit('Rejected · ' + m.first + ' was notified'); } });
  },
  release: el => {
    const a = app(el.dataset.id), m = member(a.memberId), k = calc(a);
    openModal('Release ' + peso(k.net), `<p class="mut">${esc(full(m))} receives ${peso(k.net)} after the ${peso(k.fee)} service fee and ${peso(k.cbu)} share capital build-up.</p>
      <div class="grid2"><div class="fld"><label for="f-via">Released through</label><select class="in" id="f-via" name="via">${['GCash', 'Maya', 'Bank transfer', 'Cash at the branch'].map(v => `<option ${v === a.disb ? 'selected' : ''}>${v}</option>`).join('')}</select></div>${fld('ref', 'Reference number', '', 'text', 'autocomplete="off" placeholder="e.g. GC 8841 2207 551"')}</div>`,
      { submit: 'Mark as released', onSubmit: (fd, f) => { const ref = String(fd.get('ref')).trim(); if (ref.length < 4) { fieldErr(f, 'ref', 'Enter the transfer or voucher reference'); return false; } a.status = 'released'; a.releasedAt = now(); a.releaseRef = ref; a.disb = String(fd.get('via')); log(`released ${peso0(k.net)} to ${full(m)} through ${a.disb}`, '#/loans/' + a.id); commit('Released · the loan now shows in ' + m.first + '\'s app'); } });
  },

  memberNew: () => memberForm(null),
  memberEdit: el => memberForm(member(el.dataset.id)),
  memberToggle: el => { closeModal(); const m = member(el.dataset.id); m.status = m.status === 'Active' ? 'Inactive' : 'Active'; log(`${m.status === 'Active' ? 'reactivated' : 'deactivated'} ${full(m)}'s membership`, '#/members/' + m.id); commit(full(m) + (m.status === 'Active' ? ' reactivated' : ' deactivated')); },
  memberDelete: el => {
    const m = member(el.dataset.id), act = activeLoans(m.id);
    if (act.length) { openModal('Can\'t delete this record', `<p>${esc(full(m))} has ${act.length} loan${act.length > 1 ? 's' : ''} in progress or unpaid. Deactivate the membership instead; the record and its history stay for the co-op's books.</p>`, { foot: `<div class="md-f"><button type="button" class="btn ghost" data-act="closeModal">Close</button>${m.status === 'Active' ? `<button type="button" class="btn dark" data-act="memberToggle" data-id="${m.id}">Deactivate instead</button>` : ''}</div>` }); return; }
    openModal('Delete ' + esc(full(m)) + '?', `<p>This removes the member record and its past applications from Fundo. It can't be undone. Most co-ops deactivate instead to keep the history.</p>`, { submit: 'Delete record', danger: true, onSubmit: () => { D.members = D.members.filter(x => x.id !== m.id); D.apps = D.apps.filter(a => a.memberId !== m.id); log(`deleted the record of ${full(m)} (${m.no})`); location.hash = '#/members'; commit('Member record deleted'); } });
  },

  staffInvite: () => openModal('Invite staff', `${fld('name', 'Full name', '', 'text', 'autocomplete="off"')}${fld('email', 'Work email', '', 'email', 'autocomplete="off"')}${fld('title', 'Position', '', 'text', 'autocomplete="off" placeholder="e.g. Loan officer"')}
    <div class="fld"><label for="f-role">Role</label><select class="in" id="f-role" name="role">${Object.keys(ROLES).map(r => `<option value="${r}" ${r === 'officer' ? 'selected' : ''}>${ROLES[r].n}</option>`).join('')}</select></div>`,
    { submit: 'Send invite', onSubmit: (fd, f) => { const name = String(fd.get('name')).trim(), email = String(fd.get('email')).trim(); let bad = false;
      if (name.length < 3) { fieldErr(f, 'name', 'Enter their full name'); bad = true; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fieldErr(f, 'email', 'Enter a valid email'); bad = true; }
      if (D.staff.some(s => s.email.toLowerCase() === email.toLowerCase())) { fieldErr(f, 'email', 'This email already has access'); bad = true; }
      if (bad) return false;
      D.staff.push({ id: 's' + now(), name, email, title: String(fd.get('title')).trim() || 'Staff', role: String(fd.get('role')) }); log(`invited ${name} as ${ROLES[fd.get('role')].n}`, '#/staff'); commit('Invite sent to ' + email); } }),
  staffRemove: el => { const s = staff(el.dataset.id); openModal('Remove ' + esc(s.name) + '?', `<p>${esc(s.name)} won't be able to sign in to Fundo Admin. Their past actions stay in the activity log.</p>`, { submit: 'Remove access', danger: true, onSubmit: () => { D.staff = D.staff.filter(x => x.id !== s.id); log(`removed ${s.name}'s access`, '#/staff'); commit(s.name + ' removed'); } }); }
};

function memberForm(m) {
  const e = m || { first: '', last: '', mobile: '', tin: '', city: '', type: 'Regular', accepted: new Date().toISOString().slice(0, 10), res: '', sub: 2000, paid: 500, pmes: true };
  openModal(m ? 'Edit ' + esc(full(m)) : 'Add a member', `${m ? '' : '<p class="mut">For applicants the Board has accepted. They can sign in to Fundo with their membership number right after you save.</p>'}
    <div class="grid2">${fld('first', 'First name', e.first, 'text', 'autocomplete="off"')}${fld('last', 'Last name', e.last, 'text', 'autocomplete="off"')}</div>
    <div class="grid2">${fld('mobile', 'Mobile number', e.mobile, 'tel', 'autocomplete="off" placeholder="09XX XXX XXXX"')}${fld('tin', 'TIN', e.tin, 'text', 'autocomplete="off" inputmode="numeric" placeholder="000-000-000-000"', 'Optional')}</div>
    <div class="grid2">${fld('city', 'City or municipality', e.city, 'text', 'autocomplete="off"')}<div class="fld"><label for="f-type">Type of membership</label><select class="in" id="f-type" name="type">${['Regular', 'Associate'].map(t => `<option ${t === e.type ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
    <div class="grid2">${fld('accepted', 'Date accepted', e.accepted, 'date', `max="${new Date().toISOString().slice(0, 10)}"`)}${fld('res', 'BOD resolution no.', e.res, 'text', 'autocomplete="off" placeholder="e.g. 2026-112"')}</div>
    <div class="grid2">${fld('sub', 'Shares subscribed (₱)', e.sub, 'number', 'min="2000" step="100" inputmode="numeric"', 'At least 20 shares at ₱100')}${fld('paid', 'Paid up so far (₱)', e.paid, 'number', 'min="0" step="100" inputmode="numeric"', 'At least 25% of subscribed')}</div>
    <label class="check"><input type="checkbox" name="pmes" ${e.pmes ? 'checked' : ''}><span>Attended the pre-membership education seminar (PMES)</span></label>`,
    { wide: true, submit: m ? 'Save changes' : 'Add member', onSubmit: (fd, f) => {
      const v = k => String(fd.get(k) ?? '').trim(), sub = Number(v('sub')), paid = Number(v('paid')); let bad = false;
      const err = (k, msg) => { fieldErr(f, k, msg); bad = true; };
      if (!v('first')) err('first', 'Required'); if (!v('last')) err('last', 'Required');
      if (!/^09\d{2}\s?\d{3}\s?\d{4}$/.test(v('mobile'))) err('mobile', 'Use 09XX XXX XXXX');
      if (v('tin') && !/^\d{3}-?\d{3}-?\d{3}(-?\d{3,5})?$/.test(v('tin'))) err('tin', 'Use 000-000-000-000');
      if (!v('city')) err('city', 'Required');
      if (!v('accepted') || day(v('accepted')) > now()) err('accepted', 'Pick a date on or before today');
      if (!v('res')) err('res', 'Required for the registry');
      if (!(sub >= 2000)) err('sub', 'At least ₱2,000 (20 shares)');
      if (!(paid >= sub * .25) || paid > sub) err('paid', `Between ${peso0(sub * .25)} and ${peso0(sub || 0)}`);
      if (bad) { f.querySelector('.bad')?.focus(); return false; }
      const mob = v('mobile').replace(/\s/g, '').replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3');
      const rec = { first: v('first'), last: v('last'), mobile: mob, tin: v('tin'), city: v('city'), type: v('type'), accepted: v('accepted'), res: v('res'), sub, paid, pmes: !!fd.get('pmes') };
      if (m) { Object.assign(m, rec); log(`updated the record of ${full(m)}`, '#/members/' + m.id); commit('Record saved'); return; }
      const next = Math.max(...D.members.map(x => Number(x.no.replace(/\D/g, '')) || 0)) + 1;
      const nm = { id: 'm' + now(), no: D.coop.pre + '-' + String(next).padStart(6, '0'), sav: 0, onTime: 0, status: 'Active', ...rec };
      D.members.push(nm); log(`added ${full(nm)} as a new member (${nm.no})`, '#/members/' + nm.id); location.hash = '#/members/' + nm.id; commit(`${full(nm)} added · membership no. ${nm.no}`);
    } });
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el) { if (el.disabled) return; const f = A[el.dataset.act]; if (f) { e.preventDefault(); f(el, e); } return; }
  const tr = e.target.closest('tr[data-href]');
  if (tr && !e.target.closest('a,button')) location.hash = tr.dataset.href;
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches?.('tr[data-href]')) { location.hash = e.target.dataset.href; return; }
  if (e.key === 'Escape') { if ($('#modalWrap') && !$('#modalWrap').hidden) closeModal(); else if ($('#drawer') && !$('#drawer').hidden) A.closeLayer(); return; }
  if (e.key === 'Tab') { // keep focus inside the open dialog
    const box = $('#modalWrap') && !$('#modalWrap').hidden ? $('#modal') : $('#drawer') && !$('#drawer').hidden ? $('#drawer') : null;
    if (!box) return;
    const f = $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea', box).filter(x => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'lq') { UI.lq = e.target.value; $('#ltb').innerHTML = loanRows(); }
  else if (e.target.id === 'mq') { UI.mq = e.target.value; $('#mtb').innerHTML = memberRows(); }
  else if (e.target.classList?.contains('bad')) { e.target.classList.remove('bad'); e.target.removeAttribute('aria-invalid'); e.target.closest('.fld')?.querySelector('.err')?.remove(); }
});
document.addEventListener('change', e => {
  const s = e.target.closest('[data-role-for]'); if (!s) return;
  const st = staff(s.dataset.roleFor); st.role = s.value; log(`changed ${st.name}'s role to ${ROLES[st.role].n}`, '#/staff'); commit(st.name + ' is now ' + ROLES[st.role].n);
});
document.addEventListener('submit', e => {
  if (e.target.id === 'obForm') { e.preventDefault(); obSubmit(e.target); return; }
  if (e.target.id !== 'mdForm') return; e.preventDefault();
  if (!modalSubmit) return;
  const r = modalSubmit(new FormData(e.target), e.target);
  if (r !== false) closeModal();
});
window.addEventListener('hashchange', render);

load(); render();
