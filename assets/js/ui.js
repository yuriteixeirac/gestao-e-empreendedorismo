/* =========================================================
   Nexo · utilitários e componentes de interface
   ========================================================= */

window.UI = (() => {
  const DB = window.DB;
  const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  const toDate = (value) => {
    if (value instanceof Date) return value;
    const [datePart, timePart = '00:00'] = String(value).split('T');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm] = timePart.split(':').map(Number);
    return new Date(y, m - 1, d, hh || 0, mm || 0);
  };

  const today = () => toDate(DB.today);
  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = (target, base = today()) => {
    const a = startOfDay(toDate(target));
    const b = startOfDay(base);
    return Math.round((a - b) / 86400000);
  };

  const pad = (n) => String(n).padStart(2, '0');

  const fmtDate = (value) => {
    if (!value) return '—';
    const d = toDate(value);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const fmtDateShort = (value) => {
    if (!value) return '—';
    const d = toDate(value);
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const fmtDateTime = (value) => {
    if (!value) return '—';
    const d = toDate(value);
    return `${fmtDate(value)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const fmtTime = (value) => {
    const d = toDate(value);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const relTime = (value) => {
    const diff = today() - toDate(value);
    const mins = Math.max(0, Math.round(diff / 60000));
    if (mins < 5) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.round(mins / 60);
    if (hours < 20) return `há ${hours} h`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'ontem';
    if (days < 30) return `há ${days} dias`;
    return fmtDate(value);
  };

  const lastSeen = (value) => {
    if (!value) return 'Nunca';
    const days = diffDays(value);
    if (days === 0) return `Hoje, ${fmtTime(value)}`;
    if (days === -1) return `Ontem, ${fmtTime(value)}`;
    return fmtDateTime(value);
  };

  const plural = (n, singular, pluralForm) => `${n} ${n === 1 ? singular : pluralForm}`;

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  /* ---------- Consultas ---------- */

  const byId = (list, id) => list.find((item) => item.id === id);
  const getServer = (id) => byId(DB.servers, id);
  const getService = (id) => byId(DB.services, id);
  const getCredential = (id) => byId(DB.credentials, id);
  const getRequest = (id) => byId(DB.requests, id);

  const servicesOf = (serverId) => DB.services.filter((s) => s.serverId === serverId);
  const credentialsOf = (serverId) => DB.credentials.filter((c) => c.serverId === serverId);
  const vmsOf = (hypervisorId) => DB.servers.filter((s) => s.hypervisorId === hypervisorId);
  const requestsOf = (credentialId) => DB.requests.filter((r) => r.credentialId === credentialId);
  const auditOf = (serverId) => DB.audit.filter((a) => a.serverId === serverId);

  const credentialStatus = (cred) => {
    const days = diffDays(cred.nextDueAt);
    if (days < 0) {
      const late = Math.abs(days);
      return {
        key: 'vencida',
        short: `Vencida há ${late} d`,
        label: `Vencida há ${plural(late, 'dia', 'dias')}`,
        tone: 'danger',
      };
    }
    if (days === 0) return { key: 'atencao', short: 'Vence hoje', label: 'Vence hoje', tone: 'warn' };
    if (days <= 30) {
      return {
        key: 'atencao',
        short: `Vence em ${days} d`,
        label: days === 1 ? 'Vence amanhã' : `Vence em ${plural(days, 'dia', 'dias')}`,
        tone: 'warn',
      };
    }
    return { key: 'ok', short: 'Em dia', label: 'Em dia', tone: 'ok' };
  };

  const credentialCounts = () => {
    const out = { vencida: 0, atencao: 0, ok: 0 };
    DB.credentials.forEach((cred) => { out[credentialStatus(cred).key] += 1; });
    return out;
  };

  const serviceCounts = () => {
    const out = { total: DB.services.length, 'Em uso': 0, Revisar: 0, Desativar: 0, Desativado: 0 };
    DB.services.forEach((svc) => { out[svc.classification] = (out[svc.classification] || 0) + 1; });
    return out;
  };

  const connectionOf = (server) => {
    if (!server || !server.switchId) return null;
    const sw = byId(DB.switches, server.switchId);
    return sw ? { sw, port: server.switchPort } : null;
  };

  const scopeOf = (id) => {
    const server = getServer(id);
    if (server) {
      return {
        id,
        name: server.hostname,
        kind: server.kind === 'Virtual' ? 'VM' : 'Servidor',
        href: `#/servidores/${server.id}`,
      };
    }
    const sw = DB.switches.find((item) => item.id === id);
    if (sw) return { id, name: sw.name, kind: 'Switch', href: '#/switches' };
    return { id, name: '—', kind: '', href: null };
  };

  /* ---------- Chips ---------- */

  const chip = (label, tone = 'neutral', dot = false) => {
    const dotHtml = dot ? '<span class="dot"></span>' : '';
    return `<span class="chip chip-${tone}">${dotHtml}${escapeHtml(label)}</span>`;
  };

  const envChip = (env) => {
    const map = { 'Produção': 'accent', 'Homologação': 'info', 'Teste': 'neutral', 'Infraestrutura': 'outline' };
    return `<span class="chip chip-${map[env] || 'neutral'}">${escapeHtml(env)}</span>`;
  };

  const criticalityChip = (value) => {
    const map = { 'Crítica': 'danger', 'Alta': 'warn', 'Média': 'info', 'Baixa': 'neutral' };
    return chip(value, map[value] || 'neutral');
  };

  const statusChip = (value) => {
    const map = { 'Ativo': ['ok', true], 'Em manutenção': ['warn', true], 'Desativado': ['neutral', false] };
    const [tone, dot] = map[value] || ['neutral', false];
    return chip(value, tone, dot);
  };

  const serviceChip = (value) => {
    const map = { 'Em uso': ['ok', true], 'Revisar': ['warn', false], 'Desativar': ['danger', false], 'Desativado': ['neutral', false] };
    const [tone, dot] = map[value] || ['neutral', false];
    return chip(value, tone, dot);
  };

  const requestChip = (value) => {
    const map = { 'Aguardando aprovação': 'warn', 'Aprovada': 'info', 'Concluída': 'ok', 'Recusada': 'danger' };
    return chip(value, map[value] || 'neutral', true);
  };

  const exposureChip = (value) => {
    const map = { 'Externo': 'danger', 'Interno': 'outline' };
    return `<span class="chip chip-${map[value] || 'neutral'}">${escapeHtml(value)}</span>`;
  };

  const kindIcon = (server) => server.kind === 'Virtual' ? 'box' : 'server';

  /* ---------- Componentes ---------- */

  const statStrip = (items) => `
    <section class="stat-strip" aria-label="Indicadores">
      ${items.map((item) => `
        <${item.href ? 'a' : 'div'} class="stat" ${item.href ? `href="${item.href}"` : ''}>
          <span class="stat-top">${icon(item.icon, 14)}${item.label}</span>
          <span class="stat-value">${item.value}${item.unit ? `<small>${item.unit}</small>` : ''}</span>
          <span class="stat-note">${item.note || ''}</span>
        </${item.href ? 'a' : 'div'}>
      `).join('')}
    </section>
  `;

  const pageHead = ({ title, subtitle, actions = '', back = '' }) => `
    ${back ? `<a class="back-link" href="${back}">${icon('chevronLeft', 13)} Voltar</a>` : ''}
    <header class="page-head">
      <div class="page-head-text">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      ${actions ? `<div class="page-head-actions">${actions}</div>` : ''}
    </header>
  `;

  const searchInput = (placeholder = 'Buscar…') => `
    <label class="search-box">
      <span class="sr-only">${placeholder}</span>
      ${icon('search', 15)}
      <input class="input" type="search" placeholder="${placeholder}" data-search-input>
    </label>
  `;

  const emptyState = ({ iconName = 'search', title, text }) => `
    <div class="empty">
      <span class="empty-icon">${icon(iconName, 20)}</span>
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;

  const capacityRow = (label, value, text, tone = '') => `
    <div class="capacity-row">
      <span class="label">${label}</span>
      <span class="meter"><span class="${tone}" style="width:${Math.min(100, Math.max(2, value))}%"></span></span>
      <span class="value">${text}</span>
    </div>
  `;

  const portGrid = (sw, highlightPort) => {
    const cells = [];
    const portNumber = highlightPort ? Number((String(highlightPort).match(/(\d+)$/) || [])[1]) : 0;
    for (let i = 1; i <= sw.portCount; i += 1) {
      const isUsed = sw.usedPorts.includes(i);
      const isUplink = sw.uplinkPort === i;
      const cls = ['port'];
      if (isUsed) cls.push('is-used');
      if (isUplink) cls.push('is-uplink');
      if (portNumber === i) cls.push('is-this');
      cells.push(`<span class="${cls.join(' ')}" title="Porta ${i}${isUplink ? ' · uplink' : isUsed ? ' · em uso' : ' · livre'}"></span>`);
    }
    return `
      <div class="port-grid" role="img" aria-label="Mapa de portas do ${sw.name}">
        ${cells.join('')}
      </div>
      <div class="port-legend">
        <span><i class="port-swatch used"></i>Em uso</span>
        <span><i class="port-swatch uplink"></i>Uplink</span>
        <span><i class="port-swatch"></i>Livre</span>
      </div>
    `;
  };

  /* ---------- Overlays ---------- */

  const overlayRoot = () => document.getElementById('overlay-root');
  let lastFocus = null;

  const closeOverlay = () => {
    const root = overlayRoot();
    if (!root) return;
    root.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  };

  const openOverlay = (html, className = '') => {
    const root = overlayRoot();
    if (!root) return null;
    lastFocus = document.activeElement;
    root.innerHTML = `<div class="overlay ${className}" data-overlay>${html}</div>`;
    document.body.style.overflow = 'hidden';
    const overlay = root.querySelector('[data-overlay]');
    overlay.addEventListener('mousedown', (event) => {
      if (event.target === overlay) closeOverlay();
    });
    return overlay;
  };

  const openDialog = ({ title, description = '', body, submitLabel = 'Salvar', cancelLabel = 'Cancelar', onSubmit, wide = false, hideSubmit = false, submitTone = 'primary' }) => {
    const overlay = openOverlay(`
      <div class="dialog ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div class="dialog-head">
          <div class="dh-body">
            <h2 id="dialog-title">${title}</h2>
            ${description ? `<p>${description}</p>` : ''}
          </div>
          <button class="icon-btn" type="button" data-close-dialog aria-label="Fechar">${icon('x', 17)}</button>
        </div>
        <form id="dialog-form">
          <div class="dialog-body">${body}</div>
          <div class="dialog-foot">
            <button class="btn" type="button" data-close-dialog>${cancelLabel}</button>
            ${hideSubmit ? '' : `<button class="btn btn-${submitTone}" type="submit">${submitLabel}</button>`}
          </div>
        </form>
      </div>
    `, 'center');

    const form = overlay.querySelector('#dialog-form');
    overlay.querySelectorAll('[data-close-dialog]').forEach((btn) => btn.addEventListener('click', closeOverlay));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const result = onSubmit ? onSubmit(data) : true;
      if (result !== false) closeOverlay();
    });

    const firstField = overlay.querySelector('input:not([type="hidden"]), select, textarea');
    if (firstField) {
      firstField.focus();
      if (firstField.select && firstField.type !== 'date') firstField.select();
    }
  };

  const openPalette = () => {
    const pages = [
      { label: 'Painel', href: '#/painel', kind: 'Página' },
      { label: 'Servidores', href: '#/servidores', kind: 'Página' },
      { label: 'Serviços', href: '#/servicos', kind: 'Página' },
      { label: 'Máquinas virtuais', href: '#/vms', kind: 'Página' },
      { label: 'Hypervisores', href: '#/hypervisores', kind: 'Página' },
      { label: 'Switches', href: '#/switches', kind: 'Página' },
      { label: 'Credenciais', href: '#/credenciais', kind: 'Página' },
      { label: 'Solicitações', href: '#/solicitacoes', kind: 'Página' },
      { label: 'Relatórios', href: '#/relatorios', kind: 'Página' },
      { label: 'Auditoria', href: '#/auditoria', kind: 'Página' },
      { label: 'Usuários e permissões', href: '#/usuarios', kind: 'Página' },
    ];
    const items = [
      ...pages.map((p) => ({ ...p, group: 'Ir para' })),
      ...DB.servers.map((s) => ({ label: s.hostname, sub: `${s.ip} · ${s.purpose}`, href: `#/servidores/${s.id}`, kind: s.kind === 'Virtual' ? 'VM' : 'Servidor', group: 'Servidores' })),
      ...DB.services.map((s) => {
        const server = getServer(s.serverId);
        return { label: `${s.name} ${s.port}`, sub: `${server ? server.hostname : ''} · ${s.protocol}`, href: `#/servicos`, kind: 'Serviço', group: 'Serviços' };
      }),
      ...DB.credentials.map((c) => {
        const scope = scopeOf(c.serverId);
        return { label: `${c.username} · ${scope.name}`, sub: 'Agenda de troca de senha', href: '#/credenciais', kind: 'Credencial', group: 'Credenciais' };
      }),
    ];

    const overlay = openOverlay(`
      <div class="palette" role="dialog" aria-modal="true" aria-label="Busca global">
        <div class="palette-input">
          ${icon('search', 18)}
          <input type="text" id="palette-input" placeholder="Buscar servidor, serviço, credencial…" autocomplete="off" spellcheck="false">
          <span class="kbd">Esc</span>
        </div>
        <div class="palette-results" id="palette-results"></div>
        <div class="palette-foot">
          <span><span class="kbd">↑</span><span class="kbd">↓</span> navegar</span>
          <span><span class="kbd">↵</span> abrir</span>
          <span style="margin-left:auto">${DB.servers.length} servidores · ${DB.services.length} serviços</span>
        </div>
      </div>
    `, 'center');

    const input = overlay.querySelector('#palette-input');
    const results = overlay.querySelector('#palette-results');
    let selected = 0;
    let current = [];

    const render = (query) => {
      const q = query.trim().toLowerCase();
      let filtered = items;
      if (q) {
        filtered = items.filter((item) => `${item.label} ${item.sub || ''} ${item.kind}`.toLowerCase().includes(q));
      } else {
        filtered = [
          ...pages.slice(0, 5),
          ...DB.servers.slice(0, 4).map((s) => ({ label: s.hostname, sub: `${s.ip} · ${s.purpose}`, href: `#/servidores/${s.id}`, kind: s.kind === 'Virtual' ? 'VM' : 'Servidor', group: 'Servidores' })),
        ];
      }
      const limited = filtered.slice(0, 18);
      selected = Math.min(selected, Math.max(0, limited.length - 1));
      current = limited;

      if (!limited.length) {
        results.innerHTML = `<div class="palette-empty">Nenhum resultado para “${escapeHtml(query)}”.</div>`;
        return;
      }

      let html = '';
      let group = '';
      limited.forEach((item, index) => {
        if (item.group && item.group !== group) {
          group = item.group;
          html += `<div class="palette-group">${escapeHtml(group)}</div>`;
        }
        html += `
          <button type="button" class="palette-item ${index === selected ? 'is-selected' : ''}" data-palette-index="${index}">
            <span class="row-icon">${icon(item.kind === 'Página' ? 'grid' : item.kind === 'Servidor' || item.kind === 'VM' ? 'server' : item.kind === 'Credencial' ? 'key' : 'activity', 14)}</span>
            <span class="pi-body" style="min-width:0">
              <span class="pi-name" style="display:block">${escapeHtml(item.label)}</span>
              ${item.sub ? `<span class="cell-sub" style="color:var(--muted);font-size:10px">${escapeHtml(item.sub)}</span>` : ''}
            </span>
            <span class="pi-kind">${item.kind}</span>
          </button>`;
      });
      results.innerHTML = html;
      results.querySelectorAll('[data-palette-index]').forEach((btn) => {
        btn.addEventListener('mousemove', () => {
          selected = Number(btn.dataset.paletteIndex);
          results.querySelectorAll('.palette-item').forEach((el, i) => el.classList.toggle('is-selected', i === selected));
        });
        btn.addEventListener('click', () => {
          closeOverlay();
          location.hash = current[selected].href.replace(/^#/, '');
        });
      });
    };

    const go = () => {
      if (!current[selected]) return;
      location.hash = current[selected].href.replace(/^#/, '');
      closeOverlay();
    };

    input.addEventListener('input', () => { selected = 0; render(input.value); });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selected = Math.min(current.length - 1, selected + 1);
        render(input.value);
        results.querySelector('.is-selected')?.scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selected = Math.max(0, selected - 1);
        render(input.value);
        results.querySelector('.is-selected')?.scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        go();
      }
    });

    render('');
    input.focus();
  };

  /* ---------- Toast ---------- */

  const toast = (message, tone = 'ok') => {
    let holder = document.querySelector('.toasts');
    if (!holder) {
      holder = document.createElement('div');
      holder.className = 'toasts';
      holder.setAttribute('aria-live', 'polite');
      document.body.appendChild(holder);
    }
    const el = document.createElement('div');
    el.className = `toast ${tone !== 'ok' ? `is-${tone}` : ''}`;
    el.innerHTML = `${icon(tone === 'ok' ? 'check' : 'alert', 16)}<span>${escapeHtml(message)}</span>`;
    holder.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => el.remove(), 180);
    }, 3400);
  };

  /* ---------- Diversos ---------- */

  const percent = (value, total) => (total ? Math.round((value / total) * 100) : 0);

  const downloadCsv = (filename, rows) => {
    const csv = rows.map((row) => row.map((cell) => {
      const text = String(cell ?? '');
      return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    }).join(';')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return {
    DB,
    toDate,
    today,
    diffDays,
    fmtDate,
    fmtDateShort,
    fmtDateTime,
    fmtTime,
    relTime,
    lastSeen,
    plural,
    escapeHtml,
    byId,
    getServer,
    getService,
    getCredential,
    getRequest,
    servicesOf,
    credentialsOf,
    vmsOf,
    requestsOf,
    auditOf,
    credentialStatus,
    credentialCounts,
    serviceCounts,
    connectionOf,
    scopeOf,
    chip,
    envChip,
    criticalityChip,
    statusChip,
    serviceChip,
    requestChip,
    exposureChip,
    kindIcon,
    statStrip,
    pageHead,
    searchInput,
    emptyState,
    capacityRow,
    portGrid,
    openDialog,
    closeOverlay,
    openPalette,
    toast,
    percent,
    downloadCsv,
  };
})();
