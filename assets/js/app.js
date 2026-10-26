/* =========================================================
   Infraguard · aplicação (navegação, ações e estado da demonstração)
   ========================================================= */

(() => {
  const DB = window.DB;
  const S = window.UI;
  const V = window.Views;

  const META = {
    painel: { title: 'Painel', group: 'Visão geral', nav: 'painel' },
    servidores: { title: 'Servidores', group: 'Inventário', nav: 'servidores' },
    servicos: { title: 'Serviços', group: 'Inventário', nav: 'servicos' },
    vms: { title: 'Máquinas virtuais', group: 'Inventário', nav: 'vms' },
    hypervisores: { title: 'Hypervisores', group: 'Inventário', nav: 'hypervisores' },
    switches: { title: 'Switches', group: 'Inventário', nav: 'switches' },
    credenciais: { title: 'Credenciais', group: 'Acesso', nav: 'credenciais' },
    solicitacoes: { title: 'Solicitações', group: 'Acesso', nav: 'solicitacoes' },
    relatorios: { title: 'Relatórios', group: 'Governança', nav: 'relatorios' },
    auditoria: { title: 'Auditoria', group: 'Governança', nav: 'auditoria' },
    usuarios: { title: 'Usuários e permissões', group: 'Governança', nav: 'usuarios' },
    login: { title: 'Entrar', group: 'Acesso', nav: '' },
  };

  const icon = window.icon;

  /* =======================================================
     Estrutura fixa
     ======================================================= */

  const navItem = ({ key, label, iconName, href, badgeId }) => `
    <a class="nav-item" data-nav="${key}" href="${href}">
      ${icon(iconName, 16)}
      <span>${label}</span>
      ${badgeId ? `<span class="nav-count" id="${badgeId}" hidden>0</span>` : ''}
    </a>
  `;

  const shell = () => `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="#/painel" aria-label="Infraguard — ir para o painel">
          <span class="brand-mark">${window.brandMark()}</span>
          <span>
            <span class="brand-name">Infraguard</span>
            <span class="brand-sub">central de infraestrutura</span>
          </span>
        </a>
        <div class="side-scroll">
          <div class="nav-group">
            <div class="nav-label">Visão geral</div>
            ${navItem({ key: 'painel', label: 'Painel', iconName: 'grid', href: '#/painel' })}
          </div>
          <div class="nav-group">
            <div class="nav-label">Inventário</div>
            ${navItem({ key: 'servidores', label: 'Servidores', iconName: 'server', href: '#/servidores' })}
            ${navItem({ key: 'servicos', label: 'Serviços', iconName: 'activity', href: '#/servicos' })}
            ${navItem({ key: 'vms', label: 'Máquinas virtuais', iconName: 'box', href: '#/vms' })}
            ${navItem({ key: 'hypervisores', label: 'Hypervisores', iconName: 'layers', href: '#/hypervisores' })}
            ${navItem({ key: 'switches', label: 'Switches', iconName: 'switch', href: '#/switches' })}
          </div>
          <div class="nav-group">
            <div class="nav-label">Acesso</div>
            ${navItem({ key: 'credenciais', label: 'Credenciais', iconName: 'key', href: '#/credenciais', badgeId: 'nav-count-credentials' })}
            ${navItem({ key: 'solicitacoes', label: 'Solicitações', iconName: 'clipboard', href: '#/solicitacoes', badgeId: 'nav-count-requests' })}
          </div>
          <div class="nav-group">
            <div class="nav-label">Governança</div>
            ${navItem({ key: 'relatorios', label: 'Relatórios', iconName: 'chart', href: '#/relatorios' })}
            ${navItem({ key: 'auditoria', label: 'Auditoria', iconName: 'shield', href: '#/auditoria' })}
            ${navItem({ key: 'usuarios', label: 'Usuários e permissões', iconName: 'users', href: '#/usuarios' })}
          </div>
        </div>
        <div class="side-foot">
          <button class="side-user" data-action="user-menu">
            <span class="avatar">${DB.currentUser.initials}</span>
            <span>
              <span class="side-user-name">${DB.currentUser.name}</span>
              <span class="side-user-role">${DB.currentUser.role}</span>
            </span>
          </button>
        </div>
      </aside>

      <div class="nav-scrim" data-action="close-nav" aria-hidden="true"></div>

      <div class="main">
        <header class="topbar">
          <button class="icon-btn nav-toggle" data-action="toggle-nav" aria-label="Abrir menu">${icon('menu', 19)}</button>
          <div class="crumbs" id="crumbs"></div>
          <div class="top-actions">
            <button class="search-trigger" data-action="palette" aria-label="Busca global">
              ${icon('search', 15)}
              <span>Buscar…</span>
              <span class="kbd">Ctrl K</span>
            </button>
            <span class="top-date">24 out 2026</span>
            <button class="icon-btn" data-action="notifications" aria-label="Notificações">
              ${icon('bell', 17)}
              <span class="dot" id="notif-dot"></span>
            </button>
            <span style="width:1px;height:22px;background:var(--line)"></span>
            <button class="icon-btn" data-action="user-menu" aria-label="Menu do usuário" style="width:auto;padding:0 4px">
              <span class="avatar sm">${DB.currentUser.initials}</span>
            </button>
          </div>
          <div id="popover-root"></div>
        </header>
        <main class="page" id="view" tabindex="-1"></main>
      </div>
    </div>
  `;

  /* =======================================================
     Navegação
     ======================================================= */

  const parseRoute = () => {
    const raw = location.hash.replace(/^#\/?/, '');
    const path = raw.split('?')[0];
    const parts = path.split('/').filter(Boolean);
    return { page: parts[0] || 'painel', param: parts[1] ? decodeURIComponent(parts[1]) : '' };
  };

  const renderers = {
    painel: () => V.dashboard(),
    servidores: (param) => (param ? V.serverDetail(param) : V.servers()),
    servicos: () => V.services(),
    vms: () => V.vms(),
    hypervisores: () => V.hypervisors(),
    switches: () => V.switches(),
    credenciais: () => V.credentials(),
    solicitacoes: () => V.requests(),
    relatorios: () => V.reports(),
    auditoria: () => V.audit(),
    usuarios: () => V.users(),
    login: () => V.login(),
  };

  const renderRoute = () => {
    const route = parseRoute();
    const isLogin = route.page === 'login';
    const page = META[route.page] ? route.page : 'painel';
    const meta = META[page];
    const view = document.getElementById('view');
    if (!view) return;

    document.body.classList.toggle('is-login', isLogin);
    document.body.classList.remove('nav-open');
    closePopover();

    let title = meta.title;
    if (page === 'servidores' && route.param) {
      const server = S.getServer(route.param);
      title = server ? server.hostname : 'Servidor';
    }

    view.innerHTML = (renderers[page] || renderers.painel)(route.param);

    document.title = `${isLogin ? 'Entrar' : title} · Infraguard`;

    if (!isLogin) {
      updateChrome(meta, route, title);
    }
    refreshBadges();
    window.scrollTo(0, 0);
  };

  const updateChrome = (meta, route, title) => {
    document.querySelectorAll('.nav-item').forEach((item) => {
      const active = item.dataset.nav === meta.nav;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    const crumbs = document.getElementById('crumbs');
    if (!crumbs) return;

    const sep = '<span class="sep">/</span>';
    if (route.page === 'servidores' && route.param) {
      crumbs.innerHTML = `<span>${meta.group}</span>${sep}<a href="#/servidores">Servidores</a>${sep}<span class="current">${S.escapeHtml(title)}</span>`;
    } else {
      crumbs.innerHTML = `<span>${meta.group}</span>${sep}<span class="current">${meta.title}</span>`;
    }
  };

  const refreshBadges = () => {
    const cc = S.credentialCounts();
    const pending = DB.requests.filter((r) => r.status === 'Aguardando aprovação').length;

    const credBadge = document.getElementById('nav-count-credentials');
    if (credBadge) {
      credBadge.textContent = cc.vencida;
      credBadge.hidden = cc.vencida === 0;
      credBadge.classList.toggle('is-alert', cc.vencida > 0);
      credBadge.closest('.nav-item')?.setAttribute('title', `${cc.vencida} credenciais vencidas`);
    }

    const reqBadge = document.getElementById('nav-count-requests');
    if (reqBadge) {
      reqBadge.textContent = pending;
      reqBadge.hidden = pending === 0;
      reqBadge.classList.toggle('is-alert', pending > 0);
      reqBadge.closest('.nav-item')?.setAttribute('title', `${pending} solicitações aguardando aprovação`);
    }

    const dot = document.getElementById('notif-dot');
    if (dot) dot.hidden = cc.vencida + pending === 0;
  };

  /* =======================================================
     Popovers
     ======================================================= */

  const popoverRoot = () => document.getElementById('popover-root');

  const closePopover = () => {
    const root = popoverRoot();
    if (!root) return;
    root.innerHTML = '';
    root.dataset.open = '';
  };

  const openPopover = (kind, html) => {
    const root = popoverRoot();
    if (!root) return;
    if (root.dataset.open === kind) {
      closePopover();
      return;
    }
    root.dataset.open = kind;
    root.innerHTML = `<div class="dropdown" data-popover="${kind}">${html}</div>`;
  };

  const notificationsHtml = () => {
    const cc = S.credentialCounts();
    const pendingReqs = DB.requests.filter((r) => r.status === 'Aguardando aprovação');
    const pending = pendingReqs.length;
    const pendingReq = pendingReqs[0];
    const pendingCred = pendingReq ? S.getCredential(pendingReq.credentialId) : null;
    const pendingScope = pendingCred ? S.scopeOf(pendingCred.serverId) : null;
    const toDisable = DB.services.filter((s) => s.classification === 'Desativar');
    const disableSub = toDisable.length
      ? toDisable.slice(0, 2).map((s) => `${s.name} em ${S.scopeOf(s.serverId).name}`).join(' · ')
      : 'Nenhum serviço pendente';

    return `
      <div class="dropdown-head">Pendências de hoje</div>
      <a class="dropdown-item" href="#/credenciais">
        <span class="mini-icon ${cc.vencida ? 'is-danger' : ''}">${icon('key', 14)}</span>
        <span class="di-body">
          <span class="di-title">${cc.vencida} ${cc.vencida === 1 ? 'credencial vencida' : 'credenciais vencidas'}</span>
          <span class="di-sub">${cc.atencao} também vencem nos próximos 30 dias</span>
        </span>
        <span class="di-right">${icon('chevronRight', 13)}</span>
      </a>
      <a class="dropdown-item" href="#/solicitacoes">
        <span class="mini-icon ${pending ? 'is-warn' : ''}">${icon('clipboard', 14)}</span>
        <span class="di-body">
          <span class="di-title">${pending ? `${pending} ${pending === 1 ? 'solicitação aguardando aprovação' : 'solicitações aguardando aprovação'}` : 'Nenhuma solicitação pendente'}</span>
          <span class="di-sub">${pendingReq ? `${pendingReq.id} · ${pendingCred?.username || ''} · ${pendingScope?.name || ''}` : 'Fila de aprovação em dia'}</span>
        </span>
        <span class="di-right">${icon('chevronRight', 13)}</span>
      </a>
      <a class="dropdown-item" href="#/servicos">
        <span class="mini-icon ${toDisable.length ? 'is-warn' : ''}">${icon('activity', 14)}</span>
        <span class="di-body">
          <span class="di-title">${toDisable.length} ${toDisable.length === 1 ? 'serviço marcado' : 'serviços marcados'} para desativar</span>
          <span class="di-sub">${disableSub}</span>
        </span>
        <span class="di-right">${icon('chevronRight', 13)}</span>
      </a>
      <div class="dropdown-foot">Pendências calculadas a partir do catálogo atual.</div>
    `;
  };

  const userMenuHtml = () => `
    <div class="dropdown-head">Sessão ativa</div>
    <div class="dropdown-item" style="cursor:default">
      <span class="avatar">${DB.currentUser.initials}</span>
      <span class="di-body">
        <span class="di-title">${DB.currentUser.name}</span>
        <span class="di-sub">${DB.currentUser.role} · ${DB.currentUser.email}</span>
      </span>
    </div>
    <div class="dropdown-sep"></div>
    <div class="dropdown-item" style="cursor:default">
      ${icon('shield', 15)}
      <span class="di-body">
        <span class="di-title">Autenticação em dois fatores</span>
        <span class="di-sub">Ativa · sessão iniciada às 08:42</span>
      </span>
    </div>
    <div class="dropdown-sep"></div>
    <button class="dropdown-item" data-action="logout">
      ${icon('logout', 15)}
      <span class="di-body"><span class="di-title">Sair</span><span class="di-sub">Encerrar a sessão de demonstração</span></span>
    </button>
  `;

  /* =======================================================
     Filtros de tabela
     ======================================================= */

  const fold = (value) => String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const applyScope = (scope) => {
    const chip = scope.querySelector('.filter-chip.is-active');
    const filter = chip?.dataset.filter || 'todos';
    const input = scope.querySelector('[data-search-input]');
    const query = fold(input?.value.trim() || '');
    const rows = [...scope.querySelectorAll('tr[data-row]')];

    let visible = 0;
    rows.forEach((row) => {
      const tags = (row.dataset.tags || '').split(/\s+/).filter(Boolean);
      const text = fold(row.dataset.searchable || row.textContent);
      const matchFilter = filter === 'todos' || tags.includes(filter);
      const matchSearch = !query || text.includes(query) || tags.some((tag) => tag.includes(query));
      row.hidden = !(matchFilter && matchSearch);
      if (!row.hidden) visible += 1;
    });

    const counter = scope.querySelector('[data-result-count]');
    if (counter) counter.textContent = visible;

    const tbody = scope.querySelector('tbody');
    if (!tbody) return;
    let empty = tbody.querySelector('.search-empty');
    if (!empty) {
      const cols = scope.querySelectorAll('thead th').length || 6;
      empty = document.createElement('tr');
      empty.className = 'empty-row search-empty';
      empty.innerHTML = `<td colspan="${cols}">Nenhum registro corresponde aos filtros selecionados.</td>`;
      tbody.appendChild(empty);
    }
    empty.hidden = visible > 0;
  };

  /* =======================================================
     Ações
     ======================================================= */

  const isoDay = (date) => {
    const d = date instanceof Date ? date : S.toDate(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const addDays = (value, days) => {
    const d = S.toDate(value);
    d.setDate(d.getDate() + days);
    return isoDay(d);
  };

  const nextRequestId = () => {
    const max = DB.requests.reduce((acc, req) => {
      const num = Number(String(req.id).replace(/\D/g, ''));
      return Number.isFinite(num) && num > acc ? num : acc;
    }, 0);
    return `REQ-${String(max + 1).padStart(3, '0')}`;
  };

  const addAudit = (entry) => {
    DB.audit.unshift({
      id: `a-${Date.now()}`,
      at: DB.today,
      ip: '10.10.1.42',
      tone: 'neutral',
      ...entry,
    });
  };

  const credentialOptions = (selectedId) => {
    const groups = {};
    DB.credentials.forEach((cred) => {
      if (!groups[cred.serverId]) groups[cred.serverId] = [];
      groups[cred.serverId].push(cred);
    });
    return Object.keys(groups)
      .sort((a, b) => (S.getServer(a)?.hostname || '').localeCompare(S.getServer(b)?.hostname || ''))
      .map((serverId) => {
        const scope = S.scopeOf(serverId);
        return `<optgroup label="${S.escapeHtml(scope.name)}">
          ${groups[serverId].map((cred) => {
            const status = S.credentialStatus(cred);
            return `<option value="${cred.id}" ${cred.id === selectedId ? 'selected' : ''}>${S.escapeHtml(cred.username)} · ${status.label}</option>`;
          }).join('')}
        </optgroup>`;
      }).join('');
  };

  const openRequestDialog = (credentialId) => {
    const sorted = DB.credentials.slice().sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt));
    const current = credentialId || sorted[0]?.id;
    const cred = S.getCredential(current);

    S.openDialog({
      title: 'Solicitar troca de senha',
      description: 'A solicitação entra na fila de aprovação da coordenação. O Infraguard não solicita nem armazena a senha.',
      submitLabel: 'Enviar solicitação',
      body: `
        <div class="field">
          <label for="req-credential">Credencial</label>
          <select class="select" id="req-credential" name="credential" required>
            ${credentialOptions(current)}
          </select>
          <span class="hint">${cred ? `Responsável atual: ${S.escapeHtml(cred.owner)} · próxima troca em ${S.fmtDate(cred.nextDueAt)}` : ''}</span>
        </div>
        <div class="field">
          <label for="req-date">Data prevista para execução</label>
          <input class="input" id="req-date" type="date" name="scheduledFor" value="${addDays(DB.today, 3)}" required>
        </div>
        <div class="field">
          <label for="req-note">Justificativa</label>
          <textarea class="textarea" id="req-note" name="note" placeholder="Ex.: rotação vencida há 14 dias, priorizar antes do fechamento do mês." required></textarea>
        </div>
        <div class="cred-note" style="margin:0">
          ${icon('lock', 15)}
          <span>A execução acontece fora do Infraguard, no equipamento ou no cofre institucional. Aqui ficam registrados solicitante, aprovador, datas e evidência.</span>
        </div>
      `,
      onSubmit: (data) => {
        const target = S.getCredential(data.get('credential'));
        if (!target) {
          S.toast('Selecione uma credencial válida.', 'danger');
          return false;
        }
        const id = nextRequestId();
        const targetScope = S.scopeOf(target.serverId);
        DB.requests.unshift({
          id,
          credentialId: target.id,
          requestedBy: DB.currentUser.name,
          requestedAt: DB.today,
          approver: 'Mariana Costa',
          status: 'Aguardando aprovação',
          scheduledFor: `${data.get('scheduledFor')}T18:00:00`,
          note: String(data.get('note') || '').trim(),
        });
        addAudit({
          actor: DB.currentUser.name,
          action: 'Solicitou troca de senha',
          entityType: 'Credencial',
          entityId: target.id,
          entityLabel: `${target.username} · ${targetScope.name}`,
          detail: `Solicitação ${id} aguardando aprovação.`,
          tone: 'warn',
          serverId: target.serverId,
        });
        S.toast(`Solicitação ${id} enviada para aprovação.`);
        if (parseRoute().page !== 'solicitacoes') location.hash = '#/solicitacoes';
        else renderRoute();
      },
    });
  };

  const requestDetail = (id) => {
    const req = S.getRequest(id);
    if (!req) return;
    const cred = S.getCredential(req.credentialId);
    const scope = cred ? S.scopeOf(cred.serverId) : null;
    const field = (label, value) => `<div><div class="small muted" style="margin-bottom:2px">${label}</div><div style="font-size:12.5px">${value}</div></div>`;

    S.openDialog({
      title: `Solicitação ${req.id}`,
      description: 'Registro completo do fluxo de troca, com responsáveis e datas.',
      cancelLabel: 'Fechar',
      hideSubmit: true,
      body: `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:13px">
          ${field('Credencial', cred ? `<span class="mono">${S.escapeHtml(cred.username)}</span>` : '—')}
          ${field('Escopo', scope ? (scope.href ? `<a class="mono link" href="${scope.href}">${S.escapeHtml(scope.name)}</a>` : S.escapeHtml(scope.name)) : '—')}
          ${field('Solicitante', S.escapeHtml(req.requestedBy))}
          ${field('Aprovador', S.escapeHtml(req.approver))}
          ${field('Solicitada em', S.fmtDateTime(req.requestedAt))}
          ${field('Agendada para', S.fmtDateTime(req.scheduledFor))}
          ${req.approvedAt ? field('Aprovada em', S.fmtDateTime(req.approvedAt)) : ''}
          ${req.completedAt ? field('Concluída em', S.fmtDateTime(req.completedAt)) : ''}
        </div>
        <div>
          <div class="small muted" style="margin-bottom:4px">Situação</div>
          ${S.requestChip(req.status)}
        </div>
        <div class="field">
          <label>Justificativa</label>
          <div class="notes-box" style="border:1px solid var(--line);border-radius:6px">${S.escapeHtml(req.note || 'Sem observações.')}</div>
        </div>
        <div class="cred-note" style="margin:0">${icon('lock', 15)}<span>O segredo não é exibido nem armazenado. A evidência da execução fica vinculada ao processo.</span></div>
      `,
    });
  };

  const editServerDialog = (id) => {
    const server = S.getServer(id);
    if (!server) return;
    const options = (list, value) => list.map((item) => `<option ${item === value ? 'selected' : ''}>${item}</option>`).join('');

    S.openDialog({
      title: 'Editar ficha do servidor',
      description: `${server.hostname} · alterações ficam registradas na auditoria.`,
      submitLabel: 'Salvar alterações',
      wide: true,
      body: `
        <div class="field">
          <label for="edit-purpose">Finalidade</label>
          <input class="input" id="edit-purpose" name="purpose" value="${S.escapeHtml(server.purpose)}" required>
        </div>
        <div class="row-2">
          <div class="field">
            <label for="edit-env">Ambiente</label>
            <select class="select" id="edit-env" name="environment">${options(['Produção', 'Homologação', 'Teste', 'Infraestrutura'], server.environment)}</select>
          </div>
          <div class="field">
            <label for="edit-crit">Criticidade</label>
            <select class="select" id="edit-crit" name="criticality">${options(['Crítica', 'Alta', 'Média', 'Baixa'], server.criticality)}</select>
          </div>
        </div>
        <div class="row-2">
          <div class="field">
            <label for="edit-status">Situação</label>
            <select class="select" id="edit-status" name="status">${options(['Ativo', 'Em manutenção', 'Desativado'], server.status)}</select>
          </div>
          <div class="field">
            <label for="edit-owner">Responsável</label>
            <input class="input" id="edit-owner" name="responsible" value="${S.escapeHtml(server.responsible)}">
          </div>
        </div>
      `,
      onSubmit: (data) => {
        server.purpose = String(data.get('purpose')).trim();
        server.environment = data.get('environment');
        server.criticality = data.get('criticality');
        server.status = data.get('status');
        server.responsible = data.get('responsible');
        server.updatedAt = DB.today;
        addAudit({
          actor: DB.currentUser.name,
          action: 'Atualizou ficha do servidor',
          entityType: 'Servidor',
          entityId: server.id,
          entityLabel: server.hostname,
          detail: 'Finalidade, ambiente ou responsável revisados.',
          tone: 'neutral',
          serverId: server.id,
        });
        S.toast('Ficha do servidor atualizada.');
        renderRoute();
      },
    });
  };

  const newServerDialog = () => {
    const hypervisors = DB.servers.filter((s) => s.isHypervisor);
    S.openDialog({
      title: 'Novo servidor',
      description: 'Cadastre a máquina no catálogo. Os vínculos de rede podem ser completados depois.',
      submitLabel: 'Cadastrar servidor',
      wide: true,
      body: `
        <div class="row-2">
          <div class="field">
            <label for="new-host">Hostname</label>
            <input class="input" id="new-host" name="hostname" placeholder="srv-arquivo02" required>
          </div>
          <div class="field">
            <label for="new-ip">Endereço IP</label>
            <input class="input" id="new-ip" name="ip" placeholder="10.10.0.80" required>
          </div>
        </div>
        <div class="row-2">
          <div class="field">
            <label for="new-kind">Tipo</label>
            <select class="select" id="new-kind" name="kind"><option>Físico</option><option>Virtual</option></select>
          </div>
          <div class="field">
            <label for="new-env">Ambiente</label>
            <select class="select" id="new-env" name="environment"><option>Produção</option><option>Homologação</option><option>Teste</option><option>Infraestrutura</option></select>
          </div>
        </div>
        <div class="row-2">
          <div class="field">
            <label for="new-os">Sistema operacional</label>
            <select class="select" id="new-os" name="os">
              <option>Ubuntu Server</option><option>Debian</option><option>Windows Server</option><option>Rocky Linux</option><option>Proxmox VE</option><option>CentOS</option>
            </select>
          </div>
          <div class="field">
            <label for="new-osver">Versão</label>
            <input class="input" id="new-osver" name="osVersion" placeholder="22.04 LTS">
          </div>
        </div>
        <div class="field">
          <label for="new-purpose">Finalidade</label>
          <input class="input" id="new-purpose" name="purpose" placeholder="Ex.: servidor de arquivos do setor administrativo" required>
        </div>
        <div class="row-2">
          <div class="field">
            <label for="new-crit">Criticidade</label>
            <select class="select" id="new-crit" name="criticality"><option>Média</option><option>Alta</option><option>Crítica</option><option>Baixa</option></select>
          </div>
          <div class="field">
            <label for="new-owner">Responsável</label>
            <input class="input" id="new-owner" name="responsible" value="${S.escapeHtml(DB.currentUser.name)}">
          </div>
        </div>
        <div class="field">
          <label for="new-hv">Hypervisor (somente para máquinas virtuais)</label>
          <select class="select" id="new-hv" name="hypervisor">
            ${hypervisors.map((hv) => `<option value="${hv.id}">${hv.hostname} · ${hv.cluster}</option>`).join('')}
          </select>
          <span class="hint">Se o tipo for físico, este campo é ignorado.</span>
        </div>
      `,
      onSubmit: (data) => {
        const hostname = String(data.get('hostname')).trim();
        if (DB.servers.some((s) => fold(s.hostname) === fold(hostname))) {
          S.toast('Já existe um servidor com esse hostname.', 'danger');
          return false;
        }
        let id = hostname.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') || `srv-${Date.now()}`;
        if (DB.servers.some((s) => s.id === id)) id = `${id}-2`;

        const kind = data.get('kind');
        const isVm = kind === 'Virtual';
        const hv = S.getServer(data.get('hypervisor')) || DB.servers.find((s) => s.isHypervisor);
        const vmId = isVm ? Math.max(0, ...DB.servers.map((s) => s.vmId || 0)) + 1 : null;

        const server = {
          id,
          hostname,
          ip: String(data.get('ip')).trim(),
          kind,
          os: data.get('os'),
          osVersion: String(data.get('osVersion') || '').trim() || '—',
          purpose: String(data.get('purpose')).trim(),
          environment: data.get('environment'),
          criticality: data.get('criticality'),
          status: 'Ativo',
          location: isVm && hv ? `${hv.hostname} · VM ${vmId}` : 'A definir',
          responsible: String(data.get('responsible') || DB.currentUser.name).trim(),
          updatedAt: DB.today,
          notes: 'Registro criado na demonstração. Complete a ficha com localização e vínculos de rede.',
          ...(isVm && hv ? { hypervisorId: hv.id, vmId, vcpu: 2, ram: 4, disk: 40 } : {}),
          ...(isVm ? {} : { gateway: '10.10.0.1' }),
        };

        DB.servers.push(server);
        if (isVm && hv) {
          hv.capacity.ramUsed = Math.min(hv.capacity.ramTotal, hv.capacity.ramUsed + server.ram);
          hv.capacity.diskUsed = Math.min(hv.capacity.diskTotal, hv.capacity.diskUsed + server.disk);
          hv.capacity.cpu = Math.min(100, hv.capacity.cpu + 5);
        }
        addAudit({
          actor: DB.currentUser.name,
          action: 'Cadastrou servidor',
          entityType: 'Servidor',
          entityId: server.id,
          entityLabel: server.hostname,
          detail: 'Ficha inicial criada no catálogo.',
          tone: 'accent',
          serverId: server.id,
        });
        S.toast('Servidor cadastrado no catálogo.');
        location.hash = `#/servidores/${server.id}`;
      },
    });
  };

  const newUserDialog = () => {
    S.openDialog({
      title: 'Novo usuário',
      description: 'O novo usuário entra com 2FA pendente e perfil definido abaixo.',
      submitLabel: 'Criar usuário',
      body: `
        <div class="field">
          <label for="user-name">Nome completo</label>
          <input class="input" id="user-name" name="name" placeholder="Nome do usuário" required>
        </div>
        <div class="field">
          <label for="user-email">E-mail institucional</label>
          <input class="input" id="user-email" name="email" type="email" placeholder="nome@infraguard.local" required>
        </div>
        <div class="field">
          <label for="user-role">Perfil de acesso</label>
          <select class="select" id="user-role" name="role">
            <option>Técnico de TI</option>
            <option>Coordenadora de TI</option>
            <option>Auditor</option>
            <option>Administrador do sistema</option>
          </select>
        </div>
      `,
      onSubmit: (data) => {
        const name = String(data.get('name')).trim();
        const email = String(data.get('email')).trim();
        const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
        const maxId = DB.users.reduce((acc, user) => Math.max(acc, Number(String(user.id).replace(/\D/g, '')) || 0), 0);
        DB.users.push({
          id: `u${maxId + 1}`,
          name,
          email,
          role: data.get('role'),
          initials,
          twoFactor: false,
          lastAccess: null,
          status: 'Ativo',
        });
        addAudit({
          actor: DB.currentUser.name,
          action: 'Cadastrou usuário',
          entityType: 'Usuário',
          entityId: `u${maxId + 1}`,
          entityLabel: name,
          detail: `Perfil definido como ${data.get('role')}. 2FA pendente.`,
          tone: 'accent',
        });
        S.toast('Usuário criado com 2FA pendente.');
        renderRoute();
      },
    });
  };

  const editUserDialog = (id) => {
    const user = DB.users.find((u) => u.id === id);
    if (!user) return;
    const roles = ['Técnico de TI', 'Coordenadora de TI', 'Auditor', 'Administrador do sistema', 'Estagiário'];

    S.openDialog({
      title: `Gerenciar ${user.name}`,
      description: 'Perfil e situação do usuário. Alterações ficam registradas na auditoria.',
      submitLabel: 'Salvar',
      body: `
        <div class="field">
          <label for="edit-user-role">Perfil de acesso</label>
          <select class="select" id="edit-user-role" name="role">
            ${roles.map((role) => `<option ${role === user.role ? 'selected' : ''}>${role}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="edit-user-status">Situação</label>
          <select class="select" id="edit-user-status" name="status">
            ${['Ativo', 'Inativo'].map((status) => `<option ${status === user.status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="edit-user-2fa">Autenticação em dois fatores</label>
          <select class="select" id="edit-user-2fa" name="twoFactor">
            <option value="true" ${user.twoFactor ? 'selected' : ''}>Ativa</option>
            <option value="false" ${!user.twoFactor ? 'selected' : ''}>Pendente</option>
          </select>
        </div>
      `,
      onSubmit: (data) => {
        user.role = data.get('role');
        user.status = data.get('status');
        user.twoFactor = data.get('twoFactor') === 'true';
        addAudit({
          actor: DB.currentUser.name,
          action: 'Alterou permissões',
          entityType: 'Usuário',
          entityId: user.id,
          entityLabel: user.name,
          detail: `Perfil ${user.role}, situação ${user.status}.`,
          tone: 'neutral',
        });
        S.toast('Permissões atualizadas.');
        renderRoute();
      },
    });
  };

  const approveRequest = (id) => {
    const req = S.getRequest(id);
    if (!req || req.status !== 'Aguardando aprovação') return;
    const cred = S.getCredential(req.credentialId);
    const scope = cred ? S.scopeOf(cred.serverId) : null;

    req.status = 'Aprovada';
    req.approvedAt = DB.today;
    addAudit({
      actor: 'Mariana Costa',
      action: 'Aprovou solicitação',
      entityType: 'Solicitação',
      entityId: req.id,
      entityLabel: `${req.id} · ${cred ? `${cred.username} · ${scope?.name || ''}` : ''}`,
      detail: `Janela agendada para ${S.fmtDateTime(req.scheduledFor)}.`,
      tone: 'accent',
      serverId: cred?.serverId,
    });
    S.toast('Solicitação aprovada pela coordenação.');
    renderRoute();
  };

  const completeRequest = (id) => {
    const req = S.getRequest(id);
    if (!req || req.status !== 'Aprovada') return;
    const cred = S.getCredential(req.credentialId);
    const scope = cred ? S.scopeOf(cred.serverId) : null;

    req.status = 'Concluída';
    req.completedAt = DB.today;

    if (cred) {
      cred.lastRotatedAt = isoDay(DB.today);
      cred.nextDueAt = addDays(DB.today, cred.rotationDays);
    }

    addAudit({
      actor: DB.currentUser.name,
      action: 'Concluiu troca de senha',
      entityType: 'Solicitação',
      entityId: req.id,
      entityLabel: `${req.id} · ${cred ? `${cred.username} · ${scope?.name || ''}` : ''}`,
      detail: cred ? `Próxima troca recalculada para ${S.fmtDate(cred.nextDueAt)}.` : 'Troca concluída.',
      tone: 'accent',
      serverId: cred?.serverId,
    });
    S.toast(cred ? `Troca concluída. Próxima em ${S.fmtDate(cred.nextDueAt)}.` : 'Troca concluída.');
    renderRoute();
  };

  const reviewService = (id) => {
    const service = S.getService(id);
    if (!service) return;
    const server = S.getServer(service.serverId);
    service.classification = 'Em uso';
    service.lastReviewed = isoDay(DB.today);
    addAudit({
      actor: DB.currentUser.name,
      action: 'Revisou serviço',
      entityType: 'Serviço',
      entityId: service.id,
      entityLabel: `${service.name} · ${server?.hostname || ''}`,
      detail: 'Serviço revisado e mantido em uso.',
      tone: 'neutral',
      serverId: service.serverId,
    });
    S.toast(`${service.name} revisado e mantido em uso.`);
    renderRoute();
  };

  const exportData = (kind) => {
    const today = isoDay(DB.today);
    let filename = `infraguard-${today}.csv`;
    let rows = [];

    if (kind === 'servers') {
      filename = `infraguard-servidores-${today}.csv`;
      rows = [
        ['Hostname', 'IP', 'Tipo', 'Sistema operacional', 'Versão', 'Ambiente', 'Criticidade', 'Situação', 'Finalidade', 'Responsável', 'Localização'],
        ...DB.servers.map((s) => [s.hostname, s.ip, s.kind, s.os, s.osVersion, s.environment, s.criticality, s.status, s.purpose, s.responsible, s.location]),
      ];
    } else if (kind === 'vms') {
      filename = `infraguard-maquinas-virtuais-${today}.csv`;
      rows = [
        ['VM', 'Hypervisor', 'IP', 'Sistema operacional', 'Versão', 'vCPU', 'RAM (GB)', 'Disco (GB)', 'Finalidade', 'Situação'],
        ...DB.servers.filter((s) => s.kind === 'Virtual').map((vm) => [
          vm.hostname, S.getServer(vm.hypervisorId)?.hostname || '', vm.ip, vm.os, vm.osVersion, vm.vcpu, vm.ram, vm.disk, vm.purpose, vm.status,
        ]),
      ];
    } else if (kind === 'hypervisors') {
      filename = `infraguard-hypervisores-${today}.csv`;
      rows = [
        ['Hypervisor', 'IP', 'Plataforma', 'Versão', 'Cluster', 'VMs', 'CPU (%)', 'RAM usada (GB)', 'RAM total (GB)', 'Disco usado (GB)', 'Disco total (GB)'],
        ...DB.servers.filter((s) => s.isHypervisor).map((hv) => [
          hv.hostname, hv.ip, hv.os, hv.osVersion, hv.cluster, S.vmsOf(hv.id).length,
          hv.capacity.cpu, hv.capacity.ramUsed, hv.capacity.ramTotal, hv.capacity.diskUsed, hv.capacity.diskTotal,
        ]),
      ];
    } else if (kind === 'switches') {
      filename = `infraguard-switches-${today}.csv`;
      rows = [
        ['Switch', 'Modelo', 'IP', 'Localização', 'Portas', 'Portas em uso', 'VLANs'],
        ...DB.switches.map((sw) => [sw.name, sw.model, sw.ip, sw.location, sw.portCount, sw.usedPorts.length, sw.vlans.join(', ')]),
      ];
    } else if (kind === 'services' || kind === 'idle') {
      const list = kind === 'idle'
        ? DB.services.filter((s) => s.classification === 'Revisar' || s.classification === 'Desativar')
        : DB.services;
      filename = kind === 'idle' ? `infraguard-servicos-ociosos-${today}.csv` : `infraguard-servicos-${today}.csv`;
      rows = [
        ['Serviço', 'Servidor', 'Porta', 'Protocolo', 'Exposição', 'Classificação', 'Última revisão', 'Observação'],
        ...list.map((svc) => [svc.name, S.getServer(svc.serverId)?.hostname || '', svc.port, svc.protocol, svc.exposure, svc.classification, S.fmtDate(svc.lastReviewed), svc.note]),
      ];
    } else if (kind === 'credentials') {
      filename = `infraguard-credenciais-${today}.csv`;
      rows = [
        ['Usuário', 'Servidor', 'Responsável', 'Rotação (dias)', 'Última troca', 'Próxima troca', 'Situação'],
        ...DB.credentials.map((cred) => {
          const status = S.credentialStatus(cred);
          return [cred.username, S.scopeOf(cred.serverId).name, cred.owner, cred.rotationDays, S.fmtDate(cred.lastRotatedAt), S.fmtDate(cred.nextDueAt), status.label];
        }),
      ];
    } else if (kind === 'audit') {
      filename = `infraguard-auditoria-${today}.csv`;
      rows = [
        ['Data e hora', 'Usuário', 'Operação', 'Registro', 'Detalhe', 'IP'],
        ...DB.audit.map((entry) => [S.fmtDateTime(entry.at), entry.actor, entry.action, entry.entityLabel, entry.detail, entry.ip]),
      ];
    } else {
      return;
    }

    S.downloadCsv(filename, rows);
    S.toast('Arquivo CSV gerado.');
  };

  const handleAction = (el) => {
    const action = el.dataset.action;

    switch (action) {
      case 'palette':
        S.openPalette();
        break;
      case 'notifications':
        openPopover('notifications', notificationsHtml());
        break;
      case 'user-menu':
        openPopover('user', userMenuHtml());
        break;
      case 'toggle-nav':
        document.body.classList.toggle('nav-open');
        break;
      case 'close-nav':
        document.body.classList.remove('nav-open');
        break;
      case 'logout':
        closePopover();
        document.body.classList.remove('nav-open');
        location.hash = '#/login';
        break;
      case 'open-request': {
        let credentialId = el.dataset.credential;
        if (!credentialId) {
          const route = parseRoute();
          if (route.page === 'servidores' && route.param) {
            credentialId = DB.credentials.find((c) => c.serverId === route.param)?.id;
          }
        }
        openRequestDialog(credentialId);
        break;
      }
      case 'view-request':
        requestDetail(el.dataset.id);
        break;
      case 'approve-request':
        approveRequest(el.dataset.id);
        break;
      case 'complete-request':
        completeRequest(el.dataset.id);
        break;
      case 'review-service':
        reviewService(el.dataset.id);
        break;
      case 'edit-server':
        editServerDialog(el.dataset.id);
        break;
      case 'new-server':
        newServerDialog();
        break;
      case 'new-user':
        newUserDialog();
        break;
      case 'edit-user':
        editUserDialog(el.dataset.id);
        break;
      case 'export':
        exportData(el.dataset.export);
        break;
      case 'print':
        window.print();
        break;
      default:
        break;
    }
  };

  /* =======================================================
     Eventos
     ======================================================= */

  const bindEvents = () => {
    window.addEventListener('hashchange', renderRoute);

    document.addEventListener('click', (event) => {
      const actionEl = event.target.closest('[data-action]');
      if (actionEl) {
        event.preventDefault();
        handleAction(actionEl);
        return;
      }

      const tab = event.target.closest('[data-tab]');
      if (tab) {
        const view = document.getElementById('view');
        view.querySelectorAll('.server-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
        view.querySelectorAll('.tab-panel').forEach((panel) => {
          panel.hidden = panel.dataset.panel !== tab.dataset.tab;
        });
        return;
      }

      const chip = event.target.closest('.filter-chip');
      if (chip) {
        const scope = chip.closest('[data-filter-scope]');
        if (scope) {
          scope.querySelectorAll('.filter-chip').forEach((item) => item.classList.toggle('is-active', item === chip));
          applyScope(scope);
        }
        return;
      }

      const row = event.target.closest('tr[data-href]');
      if (row && !event.target.closest('a, button, input, select, textarea, label')) {
        location.hash = row.dataset.href;
        return;
      }

      if (!event.target.closest('#popover-root')) closePopover();
      if (!event.target.closest('#sidebar') && !event.target.closest('[data-action="toggle-nav"]')) {
        document.body.classList.remove('nav-open');
      }
    });

    document.addEventListener('input', (event) => {
      if (!event.target.matches('[data-search-input]')) return;
      const scope = event.target.closest('[data-filter-scope]');
      if (scope) applyScope(scope);
    });

    document.addEventListener('submit', (event) => {
      if (!event.target.matches('.login-form')) return;
      event.preventDefault();
      location.hash = '#/painel';
      S.toast('Sessão iniciada. Bem-vindo, Diogo.');
    });

    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        S.openPalette();
        return;
      }
      if (event.key === 'Escape') {
        if (document.getElementById('overlay-root')?.children.length) S.closeOverlay();
        else closePopover();
        document.body.classList.remove('nav-open');
        return;
      }
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable;
      if (event.key === '/' && !typing) {
        const search = document.querySelector('[data-search-input]');
        if (search) {
          event.preventDefault();
          search.focus();
        }
      }
    });
  };

  /* =======================================================
     Início
     ======================================================= */

  const init = () => {
    document.getElementById('app').innerHTML = shell();
    bindEvents();
    if (!location.hash) history.replaceState(null, '', '#/painel');
    renderRoute();
  };

  init();
})();
