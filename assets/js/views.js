/* =========================================================
   Nexo · telas
   ========================================================= */

window.Views = (() => {
  const S = window.UI;
  const DB = window.DB;

  const logo = `<span class="brand-mark">${brandMark()}</span>`;

  const userInitials = (name) => S.DB.users.find((u) => u.name === name)?.initials
    || name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const auditTone = (tone) => {
    const map = { accent: 'is-accent', warn: 'is-warn', danger: 'is-danger' };
    return map[tone] || '';
  };

  /* =======================================================
     Painel
     ======================================================= */

  const dashboard = () => {
    const servers = DB.servers;
    const vms = servers.filter((s) => s.kind === 'Virtual');
    const active = servers.filter((s) => s.status === 'Ativo').length;
    const maintenance = servers.filter((s) => s.status === 'Em manutenção').length;
    const sc = S.serviceCounts();
    const cc = S.credentialCounts();
    const hypervisors = servers.filter((s) => s.isHypervisor);
    const vcpuTotal = vms.reduce((sum, vm) => sum + (vm.vcpu || 0), 0);

    const pendingCreds = DB.credentials
      .map((cred) => ({ cred, status: S.credentialStatus(cred), days: S.diffDays(cred.nextDueAt) }))
      .filter((x) => x.status.key !== 'ok')
      .sort((a, b) => a.days - b.days);

    const reviewServices = DB.services
      .filter((svc) => svc.classification === 'Revisar' || svc.classification === 'Desativar')
      .sort((a, b) => (a.classification === 'Desativar' ? -1 : 1) - (b.classification === 'Desativar' ? -1 : 1));

    const stats = S.statStrip([
      {
        label: 'Servidores catalogados', icon: 'server', value: servers.length,
        note: `<span style="color:var(--ok);font-weight:500">${active} ativos</span> · <span style="color:var(--warn);font-weight:500">${maintenance} em manutenção</span>`,
        href: '#/servidores',
      },
      {
        label: 'Máquinas virtuais', icon: 'box', value: vms.length,
        note: `em ${hypervisors.length} hypervisores · ${vcpuTotal} vCPU`,
        href: '#/vms',
      },
      {
        label: 'Serviços catalogados', icon: 'activity', value: sc.total,
        note: `${sc['Em uso']} em uso · <span class="soon">${sc.Revisar + sc.Desativar} para revisar</span>`,
        href: '#/servicos',
      },
      {
        label: 'Credenciais', icon: 'key', value: DB.credentials.length,
        note: `<span class="alert">${cc.vencida} vencidas</span> · <span class="soon">${cc.atencao} a vencer</span>`,
        href: '#/credenciais',
      },
    ]);

    return `
      ${S.pageHead({
        title: 'Bom dia, Diogo',
        subtitle: `24 de outubro de 2026 · ${pendingCreds.length} pendências de acesso e ${reviewServices.length} serviços aguardando revisão.`,
        actions: `<button class="btn btn-primary" data-action="open-request">${icon('key', 15)} Solicitar troca</button>`,
      })}
      ${stats}

      <div class="dash-grid">
        <section class="card">
          <div class="card-head">
            <h2>Senhas que exigem ação</h2>
            <span class="sub">${pendingCreds.length} credenciais</span>
            <span class="spacer"></span>
            <a class="link small" href="#/credenciais">Ver agenda</a>
          </div>
          <div class="pending-list">
            ${pendingCreds.slice(0, 5).map(({ cred, status }) => {
              const scope = S.scopeOf(cred.serverId);
              return `
                <a class="pending-item" href="#/credenciais">
                  <span class="mini-icon ${status.key === 'vencida' ? 'is-danger' : 'is-warn'}">${icon('key', 14)}</span>
                  <span class="pi-body">
                    <span class="pi-title">${S.escapeHtml(cred.username)} · ${S.escapeHtml(scope.name)}</span>
                    <span class="pi-sub">Rotação de ${cred.rotationDays} dias · próxima em ${S.fmtDate(cred.nextDueAt)}</span>
                  </span>
                  <span class="pi-right">${S.chip(status.short, status.tone, true)}</span>
                </a>`;
            }).join('')}
          </div>
          <div class="card-foot">Ordenado pela data de vencimento. Trocas dependem de aprovação da coordenação.</div>
        </section>

        <section class="card">
          <div class="card-head">
            <h2>Serviços para revisar</h2>
            <span class="sub">${reviewServices.length} serviços</span>
            <span class="spacer"></span>
            <a class="link small" href="#/servicos">Ver catálogo</a>
          </div>
          <div class="pending-list">
            ${reviewServices.slice(0, 5).map((svc) => {
              const server = S.getServer(svc.serverId);
              return `
                <a class="pending-item" href="#/servicos">
                  <span class="mini-icon ${svc.classification === 'Desativar' ? 'is-danger' : 'is-warn'}">${icon('activity', 14)}</span>
                  <span class="pi-body">
                    <span class="pi-title">${S.escapeHtml(svc.name)} · ${svc.port}/${svc.protocol}</span>
                    <span class="pi-sub">${server ? server.hostname : '—'} · revisado em ${S.fmtDate(svc.lastReviewed)}</span>
                  </span>
                  <span class="pi-right">${S.serviceChip(svc.classification)}</span>
                </a>`;
            }).join('')}
          </div>
          <div class="card-foot">A desativação só ocorre após validação técnica e autorização registrada.</div>
        </section>
      </div>

      <div class="dash-grid-2">
        <section class="card">
          <div class="card-head">
            <h2>Ocupação dos hypervisores</h2>
            <span class="spacer"></span>
            <a class="link small" href="#/hypervisores">Detalhes</a>
          </div>
          <div>
            ${hypervisors.map((hv) => `
              <div class="capacity" style="border-bottom:1px solid var(--line-2)">
                <div class="capacity-head">
                  ${icon('layers', 14)}
                  <strong class="mono">${hv.hostname}</strong>
                  <span class="muted">${hv.capacity.ramUsed}/${hv.capacity.ramTotal} GB RAM</span>
                  <span class="spacer"></span>
                  ${S.chip(`${S.vmsOf(hv.id).length} VMs`, 'neutral')}
                </div>
                ${S.capacityRow('CPU', hv.capacity.cpu, `${hv.capacity.cpu}%`, hv.capacity.cpu > 80 ? 'tone-warn' : '')}
                ${S.capacityRow('RAM', S.percent(hv.capacity.ramUsed, hv.capacity.ramTotal), `${hv.capacity.ramUsed} / ${hv.capacity.ramTotal} GB`)}
                ${S.capacityRow('Disco', S.percent(hv.capacity.diskUsed, hv.capacity.diskTotal), `${hv.capacity.diskUsed} / ${hv.capacity.diskTotal} GB`)}
              </div>
            `).join('')}
          </div>
          <div class="card-foot">Cluster PROX-A · capacidade consolidada de 128 GB de RAM.</div>
        </section>

        <section class="card">
          <div class="card-head">
            <h2>Atividade recente</h2>
            <span class="spacer"></span>
            <a class="link small" href="#/auditoria">Ver auditoria</a>
          </div>
          <div class="timeline">
            ${DB.audit.slice(0, 5).map((entry) => `
              <div class="timeline-item">
                <span class="tl-dot ${auditTone(entry.tone)}"></span>
                <div class="timeline-body">
                  <p><strong>${S.escapeHtml(entry.actor)}</strong> ${S.escapeHtml(entry.action.toLowerCase())} <span class="mono" style="font-size:10.5px;color:var(--muted)">${S.escapeHtml(entry.entityLabel)}</span></p>
                  <span class="timeline-time">${S.relTime(entry.at)} · ${S.fmtTime(entry.at)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="card-foot">Todas as operações são registradas e não podem ser editadas.</div>
        </section>
      </div>
    `;
  };

  /* =======================================================
     Servidores
     ======================================================= */

  const servers = () => {
    const total = DB.servers.length;
    const physical = DB.servers.filter((s) => s.kind === 'Físico').length;
    const virtual = DB.servers.filter((s) => s.kind === 'Virtual').length;
    const maintenance = DB.servers.filter((s) => s.status === 'Em manutenção').length;

    const rows = DB.servers.map((server) => {
      const svc = S.servicesOf(server.id);
      const pending = svc.filter((s) => s.classification === 'Revisar' || s.classification === 'Desativar').length;
      const search = [server.hostname, server.ip, server.os, server.osVersion, server.purpose, server.environment, server.criticality, server.responsible, server.location].join(' ');
      const tags = [server.kind.toLowerCase(), server.environment, server.status, server.criticality]
        .map((t) => S.escapeHtml(String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'))).join(' ');
      return `
        <tr data-row data-href="#/servidores/${server.id}" data-tags="${tags}" data-searchable="${S.escapeHtml(search)}">
          <td>
            <div class="cell-main">
              <span class="row-icon ${server.status === 'Em manutenção' ? 'tone-warn' : server.kind === 'Virtual' ? 'tone-accent' : ''}">${icon(S.kindIcon(server), 14)}</span>
              <span style="min-width:0">
                <span class="cell-title">${S.escapeHtml(server.hostname)}</span>
                <span class="cell-sub truncate" style="max-width:260px">${S.escapeHtml(server.purpose)}</span>
              </span>
            </div>
          </td>
          <td class="mono nowrap">${S.escapeHtml(server.ip)}</td>
          <td class="nowrap">${S.escapeHtml(server.os)} <span class="muted">${S.escapeHtml(server.osVersion)}</span></td>
          <td>${S.envChip(server.environment)}</td>
          <td class="nowrap muted">${server.kind}</td>
          <td class="nowrap">
            <span class="num">${svc.length}</span>
            ${pending ? `<span class="cell-sub" style="color:var(--warn)">${pending} em revisão</span>` : `<span class="cell-sub">todos em uso</span>`}
          </td>
          <td>${S.statusChip(server.status)}</td>
        </tr>`;
    }).join('');

    return `
      ${S.pageHead({
        title: 'Servidores',
        subtitle: 'Inventário de máquinas físicas e virtuais, com serviços, localização e responsáveis.',
        actions: `
          <button class="btn" data-action="export" data-export="servers">${icon('download', 15)} Exportar CSV</button>
          <button class="btn btn-primary" data-action="new-server">${icon('plus', 15)} Novo servidor</button>
        `,
      })}
      <div class="table-wrap" data-filter-scope="servers">
        <div class="table-toolbar">
          ${S.searchInput('Buscar servidor, IP ou SO…')}
          <div class="filter-bar">
            <button class="filter-chip is-active" data-filter="todos">Todos <span class="n">${total}</span></button>
            <button class="filter-chip" data-filter="fisico">Físicos <span class="n">${physical}</span></button>
            <button class="filter-chip" data-filter="virtual">Virtuais <span class="n">${virtual}</span></button>
            <button class="filter-chip" data-filter="producao">Produção <span class="n">4</span></button>
            <button class="filter-chip" data-filter="infraestrutura">Infraestrutura <span class="n">5</span></button>
            <button class="filter-chip" data-filter="em-manutencao">Manutenção <span class="n">${maintenance}</span></button>
          </div>
          <span class="spacer"></span>
          <span class="result-count"><span data-result-count>${total}</span> de ${total}</span>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead>
              <tr>
                <th>Servidor</th>
                <th>Endereço IP</th>
                <th>Sistema operacional</th>
                <th>Ambiente</th>
                <th>Tipo</th>
                <th>Serviços</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  /* =======================================================
     Ficha do servidor
     ======================================================= */

  const serverDetail = (id) => {
    const server = S.getServer(id);
    if (!server) {
      return `${S.pageHead({ title: 'Servidor não encontrado', subtitle: 'O registro pode ter sido removido do catálogo.' })}
        <div class="card">${S.emptyState({ iconName: 'server', title: 'Nada por aqui', text: 'Volte ao inventário para escolher outro servidor.' })}</div>`;
    }

    const svc = S.servicesOf(server.id);
    const creds = S.credentialsOf(server.id);
    const vms = S.vmsOf(server.id);
    const credCounts = creds.reduce((acc, cred) => {
      acc[S.credentialStatus(cred).key] += 1;
      return acc;
    }, { vencida: 0, atencao: 0, ok: 0 });
    const conn = S.connectionOf(server);
    const history = S.auditOf(server.id).slice().sort((a, b) => b.at - a.at);
    const hypervisor = server.hypervisorId ? S.getServer(server.hypervisorId) : null;

    const ledClass = server.status === 'Ativo' ? '' : server.status === 'Em manutenção' ? 'is-warn' : 'is-off';

    const tabs = [
      { id: 'visao', label: 'Visão geral' },
      { id: 'servicos', label: `Serviços ${svc.length}` },
      ...(server.isHypervisor ? [{ id: 'vms', label: `VMs ${vms.length}` }] : []),
      { id: 'credenciais', label: `Credenciais ${creds.length}` },
      { id: 'rede', label: 'Rede' },
      { id: 'historico', label: 'Histórico' },
    ];

    const overview = `
      <div class="detail-grid">
        <div style="display:grid;gap:14px">
          <section class="card">
            <div class="card-head"><h2>Ficha do servidor</h2><span class="spacer"></span><span class="tag">${S.escapeHtml(server.id)}</span></div>
            <dl class="props">
              <div class="prop"><dt>Endereço IP</dt><dd class="mono">${S.escapeHtml(server.ip)}</dd></div>
              <div class="prop"><dt>Sistema operacional</dt><dd>${S.escapeHtml(server.os)} ${S.escapeHtml(server.osVersion)}</dd></div>
              <div class="prop"><dt>Finalidade</dt><dd>${S.escapeHtml(server.purpose)}</dd></div>
              <div class="prop"><dt>Ambiente</dt><dd>${S.envChip(server.environment)}</dd></div>
              <div class="prop"><dt>Criticidade</dt><dd>${S.criticalityChip(server.criticality)}</dd></div>
              <div class="prop"><dt>Tipo</dt><dd>${server.kind}${server.vmId ? ` · VM ${server.vmId}` : ''}</dd></div>
              <div class="prop"><dt>Localização</dt><dd>${S.escapeHtml(server.location)}</dd></div>
              <div class="prop"><dt>Responsável</dt><dd>${S.escapeHtml(server.responsible)}</dd></div>
              ${server.isHypervisor ? `<div class="prop"><dt>Cluster</dt><dd class="mono">${S.escapeHtml(server.cluster)}</dd></div>` : ''}
              ${server.vcpu ? `<div class="prop"><dt>Recursos da VM</dt><dd>${server.vcpu} vCPU · ${server.ram} GB · ${server.disk} GB</dd></div>` : ''}
              <div class="prop"><dt>Última atualização</dt><dd>${S.fmtDate(server.updatedAt)}</dd></div>
            </dl>
            <div class="card-note">${icon('info', 13)} Registro mantido pela equipe de TI. Alterações ficam registradas na auditoria.</div>
          </section>

          <section class="card">
            <div class="card-head"><h2>Observações</h2></div>
            <div class="notes-box">${S.escapeHtml(server.notes || 'Nenhuma observação registrada.')}</div>
          </section>

          ${server.isHypervisor ? `
            <section class="card">
              <div class="card-head"><h2>Capacidade do hypervisor</h2><span class="spacer"></span>${S.chip(`${vms.length} VMs`, 'neutral')}</div>
              <div class="capacity">
                ${S.capacityRow('CPU', server.capacity.cpu, `${server.capacity.cpu}%`, server.capacity.cpu > 80 ? 'tone-warn' : '')}
                ${S.capacityRow('RAM', S.percent(server.capacity.ramUsed, server.capacity.ramTotal), `${server.capacity.ramUsed} / ${server.capacity.ramTotal} GB`)}
                ${S.capacityRow('Disco', S.percent(server.capacity.diskUsed, server.capacity.diskTotal), `${server.capacity.diskUsed} / ${server.capacity.diskTotal} GB`)}
              </div>
            </section>` : ''}
        </div>

        <div style="display:grid;gap:14px">
          <section class="card">
            <div class="card-head"><h2>Relações</h2></div>
            <div>
              ${conn ? `
                <a class="relation" href="#/switches">
                  ${icon('switch', 16)}
                  <span class="rel-body"><span class="rel-label">Switch conectado</span><span class="rel-value linkish">${conn.sw.name} · ${S.escapeHtml(conn.port)}</span></span>
                </a>` : ''}
              ${hypervisor ? `
                <a class="relation" href="#/servidores/${hypervisor.id}">
                  ${icon('layers', 16)}
                  <span class="rel-body"><span class="rel-label">Hospedado em</span><span class="rel-value linkish">${hypervisor.hostname}</span></span>
                </a>` : ''}
              ${server.isHypervisor ? `
                <div class="relation">
                  ${icon('box', 16)}
                  <span class="rel-body"><span class="rel-label">Máquinas virtuais</span><span class="rel-value">${vms.length ? vms.map((vm) => vm.hostname).join(', ') : 'Nenhuma VM'}</span></span>
                </div>` : ''}
              <a class="relation" href="#/servicos">
                ${icon('activity', 16)}
                <span class="rel-body"><span class="rel-label">Serviços</span><span class="rel-value linkish">${svc.length} catalogados · ${svc.filter((s) => s.classification === 'Em uso').length} em uso</span></span>
              </a>
              <a class="relation" href="#/credenciais">
                ${icon('key', 16)}
                <span class="rel-body"><span class="rel-label">Credenciais</span><span class="rel-value linkish">${creds.length} registradas</span></span>
              </a>
            </div>
          </section>

          <section class="card">
            <div class="card-head"><h2>Situação dos acessos</h2><span class="spacer"></span><a class="link small" href="#/credenciais">Agenda</a></div>
            <div class="card-body" style="display:grid;gap:10px">
              <div style="display:flex;align-items:center;gap:8px">
                ${S.chip(`${credCounts.vencida} ${credCounts.vencida === 1 ? 'vencida' : 'vencidas'}`, credCounts.vencida ? 'danger' : 'neutral', true)}
                ${S.chip(`${credCounts.atencao} a vencer`, credCounts.atencao ? 'warn' : 'neutral', true)}
                ${S.chip(`${credCounts.ok} em dia`, 'ok', true)}
              </div>
              <p class="small muted">O Nexo guarda apenas o responsável, a periodicidade e as datas de troca. Nenhuma senha é armazenada.</p>
              ${creds.length ? `<button class="btn btn-sm" data-action="open-request" data-credential="${creds[0].id}" style="justify-self:start">${icon('key', 13)} Solicitar troca</button>` : ''}
            </div>
          </section>

          ${credCounts.vencida ? `
            <div class="cred-note is-warn" style="margin:0">
              ${icon('alert', 15)}
              <span><strong>Atenção:</strong> ${S.plural(credCounts.vencida, 'credencial vencida', 'credenciais vencidas')} neste servidor. Priorize a regularização.</span>
            </div>` : ''}
        </div>
      </div>
    `;

    const servicesPanel = `
      <section class="card">
        <div class="card-head">
          <h2>Serviços do ${S.escapeHtml(server.hostname)}</h2>
          <span class="sub">${svc.length} registros</span>
          <span class="spacer"></span>
          <a class="link small" href="#/servicos">Ver catálogo completo</a>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Serviço</th><th>Porta</th><th>Exposição</th><th>Classificação</th><th>Última revisão</th><th class="col-actions">Ação</th></tr></thead>
            <tbody>
              ${svc.length ? svc.map((service) => `
                <tr>
                  <td>
                    <div class="cell-main">
                      <span class="row-icon">${icon('activity', 14)}</span>
                      <span>
                        <span class="cell-title" style="font-family:var(--font);font-weight:500">${S.escapeHtml(service.name)}</span>
                        <span class="cell-sub">${S.escapeHtml(service.note)}</span>
                      </span>
                    </div>
                  </td>
                  <td class="mono nowrap">${service.port}/${service.protocol}</td>
                  <td>${S.exposureChip(service.exposure)}</td>
                  <td>${S.serviceChip(service.classification)}</td>
                  <td class="nowrap muted">${S.fmtDate(service.lastReviewed)}</td>
                  <td class="col-actions">
                    ${service.classification === 'Revisar' || service.classification === 'Desativar'
                      ? `<button class="btn btn-sm" data-action="review-service" data-id="${service.id}">Marcar revisado</button>`
                      : `<span class="muted small">—</span>`}
                  </td>
                </tr>`).join('') : `<tr class="empty-row"><td colspan="6">Nenhum serviço cadastrado.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="card-foot">A desativação de um serviço exige aprovação e é registrada na auditoria.</div>
      </section>
    `;

    const vmsPanel = server.isHypervisor ? `
      <section class="card">
        <div class="card-head"><h2>Máquinas virtuais hospedadas</h2><span class="sub">${vms.length} VMs</span><span class="spacer"></span><a class="link small" href="#/vms">Ver todas</a></div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>VM</th><th>Sistema operacional</th><th>Recursos</th><th>Finalidade</th><th>Situação</th></tr></thead>
            <tbody>
              ${vms.length ? vms.map((vm) => `
                <tr data-href="#/servidores/${vm.id}">
                  <td><div class="cell-main"><span class="row-icon tone-accent">${icon('box', 14)}</span><span><span class="cell-title">${vm.hostname}</span><span class="cell-sub">${vm.ip} · VM ${vm.vmId}</span></span></div></td>
                  <td>${vm.os} ${vm.osVersion}</td>
                  <td class="nowrap muted">${vm.vcpu} vCPU · ${vm.ram} GB · ${vm.disk} GB</td>
                  <td>${vm.purpose}</td>
                  <td>${S.statusChip(vm.status)}</td>
                </tr>`).join('') : `<tr class="empty-row"><td colspan="5">Nenhuma VM hospedada neste hypervisor.</td></tr>`}
            </tbody>
          </table>
        </div>
      </section>` : `
      <div class="detail-grid equal">
        <section class="card">
          <div class="card-head"><h2>Máquina virtual</h2></div>
          <dl class="props">
            <div class="prop"><dt>Hypervisor</dt><dd>${hypervisor ? `<a class="link mono" href="#/servidores/${hypervisor.id}">${hypervisor.hostname}</a>` : '—'}</dd></div>
            <div class="prop"><dt>Identificador da VM</dt><dd class="mono">${server.vmId || '—'}</dd></div>
            <div class="prop"><dt>vCPU</dt><dd>${server.vcpu || '—'}</dd></div>
            <div class="prop"><dt>Memória</dt><dd>${server.ram ? `${server.ram} GB` : '—'}</dd></div>
            <div class="prop"><dt>Disco</dt><dd>${server.disk ? `${server.disk} GB` : '—'}</dd></div>
            <div class="prop"><dt>Localização</dt><dd>${S.escapeHtml(server.location)}</dd></div>
          </dl>
          <div class="card-note">${icon('info', 13)} Esta máquina é virtual. A capacidade física é gerenciada pelo hypervisor.</div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Relação de dependência</h2></div>
          <div>
            <div class="relation">${icon('layers', 16)}<span class="rel-body"><span class="rel-label">Hypervisor</span><span class="rel-value linkish">${hypervisor ? hypervisor.hostname : '—'}</span></span></div>
            <div class="relation">${icon('activity', 16)}<span class="rel-body"><span class="rel-label">Serviços nesta VM</span><span class="rel-value">${svc.map((s) => `${s.name} ${s.port}`).join(' · ') || '—'}</span></span></div>
            <div class="relation">${icon('key', 16)}<span class="rel-body"><span class="rel-label">Credenciais</span><span class="rel-value">${creds.length} registradas</span></span></div>
          </div>
        </section>
      </div>
    `;

    const credentialsPanel = `
      <section class="card">
        <div class="card-head">
          <h2>Credenciais do ${S.escapeHtml(server.hostname)}</h2>
          <span class="sub">${creds.length} registros</span>
          <span class="spacer"></span>
          <button class="btn btn-sm" data-action="open-request">${icon('key', 13)} Solicitar troca</button>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Usuário</th><th>Rotação</th><th>Última troca</th><th>Próxima troca</th><th>Situação</th><th class="col-actions">Ação</th></tr></thead>
            <tbody>
              ${creds.length ? creds.map((cred) => {
                const status = S.credentialStatus(cred);
                return `
                  <tr>
                    <td><div class="cell-main"><span class="row-icon ${status.key === 'vencida' ? 'tone-danger' : status.key === 'atencao' ? 'tone-warn' : ''}">${icon('key', 14)}</span><span><span class="cell-title">${S.escapeHtml(cred.username)}</span><span class="cell-sub">${S.escapeHtml(cred.owner)}</span></span></div></td>
                    <td class="nowrap muted">${cred.rotationDays} dias</td>
                    <td class="nowrap muted">${S.fmtDate(cred.lastRotatedAt)}</td>
                    <td class="nowrap"><span class="mono" style="font-size:11.5px">${S.fmtDate(cred.nextDueAt)}</span></td>
                    <td>${S.chip(status.short, status.tone, true)}</td>
                    <td class="col-actions"><button class="btn btn-sm" data-action="open-request" data-credential="${cred.id}">Solicitar troca</button></td>
                  </tr>`;
              }).join('') : `<tr class="empty-row"><td colspan="6">Nenhuma credencial registrada para este servidor.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="card-foot">${icon('lock', 11)} Nenhuma senha é armazenada. Apenas usuário, responsável, periodicidade e datas.</div>
      </section>
    `;

    const networkPanel = conn ? `
      <div class="detail-grid">
        <section class="card">
          <div class="card-head"><h2>Configuração de rede</h2></div>
          <dl class="props">
            <div class="prop"><dt>Endereço IP</dt><dd class="mono">${S.escapeHtml(server.ip)}</dd></div>
            <div class="prop"><dt>Gateway</dt><dd class="mono">${S.escapeHtml(server.gateway || '—')}</dd></div>
            <div class="prop"><dt>VLAN</dt><dd class="mono">${server.vlan || '—'}</dd></div>
            <div class="prop"><dt>Endereço MAC</dt><dd class="mono">${S.escapeHtml(server.mac || '—')}</dd></div>
            <div class="prop"><dt>Switch</dt><dd><a class="link" href="#/switches">${conn.sw.name}</a></dd></div>
            <div class="prop"><dt>Porta</dt><dd class="mono">${S.escapeHtml(conn.port)}</dd></div>
          </dl>
        </section>
        <section class="card">
          <div class="card-head"><h2>Porta no ${conn.sw.name}</h2><span class="spacer"></span><span class="tag">${S.escapeHtml(server.switchPort)}</span></div>
          <div class="card-body">
            ${S.portGrid(conn.sw, server.switchPort)}
            <p class="small muted" style="margin-top:9px">Porta destacada: ${S.escapeHtml(server.switchPort)} · VLAN ${server.vlan || '—'}</p>
          </div>
        </section>
      </div>
    ` : hypervisor ? `
      <div class="detail-grid equal">
        <section class="card">
          <div class="card-head"><h2>Rede virtual</h2></div>
          <dl class="props">
            <div class="prop"><dt>Endereço IP</dt><dd class="mono">${S.escapeHtml(server.ip)}</dd></div>
            <div class="prop"><dt>Gateway</dt><dd class="mono">10.10.0.1</dd></div>
            <div class="prop"><dt>Bridge</dt><dd class="mono">vmbr0</dd></div>
            <div class="prop"><dt>VLAN</dt><dd class="mono">10</dd></div>
            <div class="prop"><dt>Hypervisor</dt><dd><a class="link mono" href="#/servidores/${hypervisor.id}">${hypervisor.hostname}</a></dd></div>
            <div class="prop"><dt>Rede física</dt><dd>${hypervisor.switchId ? S.getServer(hypervisor.id) ? S.getServer(hypervisor.id).switchId : '—' : '—'}</dd></div>
          </dl>
          <div class="card-note">${icon('info', 13)} A conectividade física é fornecida pelo hypervisor. Consulte a ficha do host para a porta do switch.</div>
        </section>
        <section class="card">
          <div class="card-head"><h2>Serviços expostos</h2></div>
          <div>
            ${svc.map((service) => `
              <div class="relation">
                ${icon('activity', 15)}
                <span class="rel-body"><span class="rel-label">${S.escapeHtml(service.name)} · ${service.port}/${service.protocol}</span><span class="rel-value" style="font-family:var(--font);font-size:11.5px">${S.escapeHtml(service.exposure)} · ${S.escapeHtml(service.classification)}</span></span>
              </div>`).join('') || '<div class="notes-box muted">Nenhum serviço cadastrado.</div>'}
          </div>
        </section>
      </div>
    ` : `
      <section class="card">
        <div class="card-head"><h2>Rede</h2></div>
        <div class="notes-box muted">Nenhuma informação de rede registrada para este servidor.</div>
      </section>
    `;

    const historyPanel = `
      <section class="card">
        <div class="card-head"><h2>Histórico do servidor</h2><span class="sub">${history.length} registros</span><span class="spacer"></span><a class="link small" href="#/auditoria">Auditoria completa</a></div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Data e hora</th><th>Usuário</th><th>Operação</th><th>Detalhe</th><th>IP</th></tr></thead>
            <tbody>
              ${history.length ? history.map((entry) => `
                <tr>
                  <td class="log-time">${S.fmtDateTime(entry.at)}</td>
                  <td><div class="cell-main"><span class="avatar sm">${userInitials(entry.actor)}</span><span style="font-size:12px">${S.escapeHtml(entry.actor)}</span></div></td>
                  <td>${S.escapeHtml(entry.action)}</td>
                  <td class="log-detail">${S.escapeHtml(entry.detail)}</td>
                  <td class="mono muted" style="font-size:10.5px">${S.escapeHtml(entry.ip)}</td>
                </tr>`).join('') : `<tr class="empty-row"><td colspan="5">Nenhuma alteração registrada para este servidor.</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="card-foot">${icon('lock', 11)} Registros de auditoria são imutáveis e não podem ser apagados pela interface.</div>
      </section>
    `;

    const panels = {
      visao: overview,
      servicos: servicesPanel,
      ...(server.isHypervisor ? { vms: vmsPanel } : {}),
      credenciais: credentialsPanel,
      rede: networkPanel,
      historico: historyPanel,
    };

    return `
      <a class="back-link" href="#/servidores">${icon('chevronLeft', 13)} Servidores</a>

      <section class="server-hero">
        <div class="hero-top">
          <div class="hero-chips">
            <span class="hero-chip">${server.kind}${server.vmId ? ` · VM ${server.vmId}` : ''}</span>
            <span class="hero-chip">${S.escapeHtml(server.environment)}</span>
            <span class="hero-chip">${S.escapeHtml(server.location)}</span>
            ${server.isHypervisor ? '<span class="hero-chip is-accent">Hypervisor</span>' : ''}
          </div>
        </div>
        <div class="hero-main">
          <div class="hero-ident">
            <h1 class="hero-host">${S.escapeHtml(server.hostname)}</h1>
            <div class="hero-meta">
              <span class="ip">${S.escapeHtml(server.ip)}</span>
              <span class="sep"></span>
              <span>${S.escapeHtml(server.os)} ${S.escapeHtml(server.osVersion)}</span>
              <span class="sep"></span>
              <span>${S.escapeHtml(server.purpose)}</span>
            </div>
          </div>
          <div class="hero-right">
            <span class="hero-status"><span class="led ${ledClass}"></span>${S.escapeHtml(server.status)}</span>
            <div class="hero-actions">
              <button class="hero-btn" data-action="edit-server" data-id="${server.id}">${icon('edit', 13)} Editar</button>
              <button class="hero-btn is-primary" data-action="open-request">${icon('key', 13)} Solicitar troca</button>
            </div>
          </div>
        </div>
      </section>

      <nav class="server-tabs" aria-label="Seções do servidor">
        ${tabs.map((tab, index) => `<button class="server-tab ${index === 0 ? 'is-active' : ''}" data-tab="${tab.id}">${tab.label}</button>`).join('')}
      </nav>

      <div class="tab-panel" data-panel="visao">${panels.visao}</div>
      <div class="tab-panel" data-panel="servicos" hidden>${panels.servicos}</div>
      ${panels.vms ? `<div class="tab-panel" data-panel="vms" hidden>${panels.vms}</div>` : ''}
      <div class="tab-panel" data-panel="credenciais" hidden>${panels.credenciais}</div>
      <div class="tab-panel" data-panel="rede" hidden>${panels.rede}</div>
      <div class="tab-panel" data-panel="historico" hidden>${panels.historico}</div>
    `;
  };

  /* =======================================================
     Serviços
     ======================================================= */

  const services = () => {
    const sc = S.serviceCounts();
    const rows = DB.services.map((service) => {
      const server = S.getServer(service.serverId);
      const search = [service.name, service.protocol, service.port, service.exposure, service.classification, service.note, server?.hostname].join(' ');
      const tag = service.classification.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
      return `
        <tr data-row data-tags="${tag} ${service.exposure.toLowerCase()}" data-searchable="${S.escapeHtml(search)}">
          <td>
            <div class="cell-main">
              <span class="row-icon ${service.classification === 'Desativar' ? 'tone-danger' : service.classification === 'Revisar' ? 'tone-warn' : ''}">${icon('activity', 14)}</span>
              <span style="min-width:0">
                <span class="cell-title" style="font-family:var(--font);font-size:12.5px;font-weight:500">${S.escapeHtml(service.name)}</span>
                <span class="cell-sub truncate" style="max-width:320px">${S.escapeHtml(service.note)}</span>
              </span>
            </div>
          </td>
          <td>${server ? `<a class="mono" href="#/servidores/${server.id}" style="color:var(--accent);font-size:11.5px">${server.hostname}</a>` : '—'}</td>
          <td class="mono nowrap">${service.port}/${service.protocol}</td>
          <td>${S.exposureChip(service.exposure)}</td>
          <td>${S.serviceChip(service.classification)}</td>
          <td class="nowrap muted">${S.fmtDate(service.lastReviewed)}</td>
          <td class="col-actions">
            ${service.classification === 'Revisar' || service.classification === 'Desativar'
              ? `<button class="btn btn-sm" data-action="review-service" data-id="${service.id}">Marcar revisado</button>`
              : `<span class="muted small">—</span>`}
          </td>
        </tr>`;
    }).join('');

    return `
      ${S.pageHead({
        title: 'Serviços',
        subtitle: 'Protocolos e portas expostos por servidor, com classificação e histórico de revisão.',
        actions: `<button class="btn" data-action="export" data-export="services">${icon('download', 15)} Exportar CSV</button>`,
      })}
      <div class="table-wrap" data-filter-scope="services">
        <div class="table-toolbar">
          ${S.searchInput('Buscar serviço ou servidor…')}
          <div class="filter-bar">
            <button class="filter-chip is-active" data-filter="todos">Todos <span class="n">${sc.total}</span></button>
            <button class="filter-chip" data-filter="em-uso">Em uso <span class="n">${sc['Em uso']}</span></button>
            <button class="filter-chip" data-filter="revisar">Revisar <span class="n">${sc.Revisar}</span></button>
            <button class="filter-chip" data-filter="desativar">Desativar <span class="n">${sc.Desativar}</span></button>
            <button class="filter-chip" data-filter="desativado">Desativados <span class="n">${sc.Desativado}</span></button>
          </div>
          <span class="spacer"></span>
          <span class="result-count"><span data-result-count>${sc.total}</span> de ${sc.total}</span>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Serviço</th><th>Servidor</th><th>Porta</th><th>Exposição</th><th>Classificação</th><th>Última revisão</th><th class="col-actions">Ação</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="card-foot">${icon('alert', 11)} Serviços marcados para desativar exigem aprovação da coordenação antes de qualquer alteração.</div>
      </div>
    `;
  };

  /* =======================================================
     Máquinas virtuais
     ======================================================= */

  const vms = () => {
    const list = DB.servers.filter((s) => s.kind === 'Virtual');
    const vcpu = list.reduce((sum, vm) => sum + (vm.vcpu || 0), 0);
    const ram = list.reduce((sum, vm) => sum + (vm.ram || 0), 0);
    const disk = list.reduce((sum, vm) => sum + (vm.disk || 0), 0);
    const hypervisors = DB.servers.filter((s) => s.isHypervisor);

    const rows = list.map((vm) => {
      const hv = S.getServer(vm.hypervisorId);
      const svc = S.servicesOf(vm.id);
      const search = [vm.hostname, vm.ip, vm.os, vm.purpose, hv?.hostname].join(' ');
      return `
        <tr data-row data-href="#/servidores/${vm.id}" data-tags="${S.escapeHtml((hv?.hostname || '').toLowerCase())}" data-searchable="${S.escapeHtml(search)}">
          <td>
            <div class="cell-main">
              <span class="row-icon tone-accent">${icon('box', 14)}</span>
              <span style="min-width:0">
                <span class="cell-title">${vm.hostname}</span>
                <span class="cell-sub">${vm.ip} · VM ${vm.vmId} · ${svc.length} serviços</span>
              </span>
            </div>
          </td>
          <td>${hv ? `<a class="mono" href="#/servidores/${hv.id}" style="color:var(--accent);font-size:11.5px">${hv.hostname}</a>` : '—'}</td>
          <td class="nowrap">${vm.os} <span class="muted">${vm.osVersion}</span></td>
          <td class="nowrap muted">${vm.vcpu} vCPU · ${vm.ram} GB · ${vm.disk} GB</td>
          <td class="truncate" style="max-width:240px">${S.escapeHtml(vm.purpose)}</td>
          <td>${S.statusChip(vm.status)}</td>
        </tr>`;
    }).join('');

    return `
      ${S.pageHead({
        title: 'Máquinas virtuais',
        subtitle: 'VMs catalogadas, seus hypervisores e os recursos alocados.',
        actions: `<button class="btn" data-action="export" data-export="vms">${icon('download', 15)} Exportar CSV</button>`,
      })}
      ${S.statStrip([
        { label: 'Máquinas virtuais', icon: 'box', value: list.length, note: `distribuídas em ${hypervisors.length} hypervisores` },
        { label: 'vCPU alocadas', icon: 'cpu', value: vcpu, note: 'de 32 núcleos disponíveis no cluster' },
        { label: 'Memória alocada', icon: 'layers', value: ram, unit: 'GB', note: 'de 128 GB no cluster PROX-A' },
        { label: 'Armazenamento', icon: 'database', value: disk, unit: 'GB', note: 'de 4 TB no storage compartilhado' },
      ])}
      <div class="table-wrap" data-filter-scope="vms" style="margin-top:14px">
        <div class="table-toolbar">
          ${S.searchInput('Buscar VM ou hypervisor…')}
          <div class="filter-bar">
            <button class="filter-chip is-active" data-filter="todos">Todas <span class="n">${list.length}</span></button>
            ${hypervisors.map((hv) => `<button class="filter-chip" data-filter="${hv.hostname.toLowerCase()}">${hv.hostname} <span class="n">${S.vmsOf(hv.id).length}</span></button>`).join('')}
          </div>
          <span class="spacer"></span>
          <span class="result-count"><span data-result-count>${list.length}</span> de ${list.length}</span>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Máquina virtual</th><th>Hypervisor</th><th>Sistema operacional</th><th>Recursos</th><th>Finalidade</th><th>Situação</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  /* =======================================================
     Hypervisores
     ======================================================= */

  const hypervisors = () => {
    const list = DB.servers.filter((s) => s.isHypervisor);
    const allVms = DB.servers.filter((s) => s.kind === 'Virtual');
    const ramTotal = list.reduce((sum, hv) => sum + hv.capacity.ramTotal, 0);
    const ramUsed = list.reduce((sum, hv) => sum + hv.capacity.ramUsed, 0);
    const diskTotal = list.reduce((sum, hv) => sum + hv.capacity.diskTotal, 0);
    const diskUsed = list.reduce((sum, hv) => sum + hv.capacity.diskUsed, 0);

    return `
      ${S.pageHead({
        title: 'Hypervisores',
        subtitle: 'Plataformas de virtualização, capacidade e máquinas hospedadas.',
        actions: `<button class="btn" data-action="export" data-export="hypervisors">${icon('download', 15)} Exportar CSV</button>`,
      })}
      ${S.statStrip([
        { label: 'Hypervisores', icon: 'layers', value: list.length, note: 'cluster PROX-A · alta disponibilidade' },
        { label: 'Máquinas virtuais', icon: 'box', value: allVms.length, note: 'distribuídas entre hv-prox01 e hv-prox02' },
        { label: 'Memória do cluster', icon: 'cpu', value: ramTotal, unit: 'GB', note: `${ramUsed} GB alocados (${S.percent(ramUsed, ramTotal)}%)` },
        { label: 'Armazenamento', icon: 'database', value: Math.round(diskTotal / 1000), unit: 'TB', note: `${diskUsed} GB alocados (${S.percent(diskUsed, diskTotal)}%)` },
      ])}
      <div class="hv-grid" style="margin-top:14px">
        ${list.map((hv) => {
          const vmsList = S.vmsOf(hv.id);
          return `
            <section class="card hv-card">
              <div class="hv-band">
                <span class="led"></span>
                <div>
                  <div class="hv-name">${hv.hostname}</div>
                  <div class="hv-meta">${hv.os} ${hv.osVersion} · cluster ${hv.cluster} · ${hv.ip}</div>
                </div>
                <span class="spacer"></span>
                ${S.chip(`${vmsList.length} VMs`, 'accent')}
              </div>
              <div class="hv-kpis">
                <div class="hv-kpi"><span class="k">CPU</span><span class="v">${hv.capacity.cpu}<small>%</small></span></div>
                <div class="hv-kpi"><span class="k">Memória</span><span class="v">${hv.capacity.ramUsed}<small> / ${hv.capacity.ramTotal} GB</small></span></div>
                <div class="hv-kpi"><span class="k">Disco</span><span class="v">${hv.capacity.diskUsed}<small> / ${hv.capacity.diskTotal} GB</small></span></div>
              </div>
              <div class="hv-body">
                ${S.capacityRow('CPU', hv.capacity.cpu, `${hv.capacity.cpu}%`, hv.capacity.cpu > 80 ? 'tone-warn' : '')}
                ${S.capacityRow('RAM', S.percent(hv.capacity.ramUsed, hv.capacity.ramTotal), `${S.percent(hv.capacity.ramUsed, hv.capacity.ramTotal)}%`)}
                ${S.capacityRow('Disco', S.percent(hv.capacity.diskUsed, hv.capacity.diskTotal), `${S.percent(hv.capacity.diskUsed, hv.capacity.diskTotal)}%`)}
                <div class="hv-vms">
                  ${vmsList.map((vm) => `
                    <div class="hv-vm">
                      ${icon('box', 13)}
                      <a class="vm-name link" href="#/servidores/${vm.id}">${vm.hostname}</a>
                      <span class="muted" style="font-size:10.5px">${vm.vcpu} vCPU · ${vm.ram} GB</span>
                      <span class="spacer"></span>
                      ${S.chip(vm.environment, vm.environment === 'Produção' ? 'accent' : 'neutral')}
                    </div>`).join('')}
                </div>
              </div>
              <div class="card-foot" style="display:flex;align-items:center;gap:8px">
                <span>${S.escapeHtml(hv.location)} · ${S.escapeHtml(hv.responsible)}</span>
                <span class="spacer"></span>
                <a class="link" href="#/servidores/${hv.id}">Abrir ficha</a>
              </div>
            </section>`;
        }).join('')}
      </div>
    `;
  };

  /* =======================================================
     Switches
     ======================================================= */

  const switches = () => {
    const used = DB.switches.reduce((sum, sw) => sum + sw.usedPorts.length, 0);
    const ports = DB.switches.reduce((sum, sw) => sum + sw.portCount, 0);
    const vlans = new Set(DB.switches.flatMap((sw) => sw.vlans));

    return `
      ${S.pageHead({
        title: 'Switches',
        subtitle: 'Equipamentos de rede, portas em uso e vínculos com servidores e dispositivos.',
        actions: `<button class="btn" data-action="export" data-export="switches">${icon('download', 15)} Exportar CSV</button>`,
      })}
      ${S.statStrip([
        { label: 'Switches', icon: 'switch', value: DB.switches.length, note: '2 no rack principal · 1 no laboratório' },
        { label: 'Portas em uso', icon: 'link', value: used, unit: `/ ${ports}`, note: `${Math.round((used / ports) * 100)}% de ocupação` },
        { label: 'VLANs configuradas', icon: 'layers', value: vlans.size, note: 'VLANs 10, 20, 30, 40 e 99' },
        { label: 'Uplinks', icon: 'arrowUpRight', value: 3, note: 'todos os switches interligados' },
      ])}
      <div class="switch-grid" style="margin-top:14px">
        ${DB.switches.map((sw) => {
          const dev = (name) => {
            const server = DB.servers.find((s) => s.hostname === name);
            return server
              ? `<a class="conn-name mono link" href="#/servidores/${server.id}">${name}</a>`
              : `<span class="conn-name">${S.escapeHtml(name)}</span>`;
          };
          return `
            <section class="card switch-card">
              <div class="card-head">
                <div class="sh-main">
                  <div class="switch-name">${sw.name}</div>
                  <div class="switch-sub">${S.escapeHtml(sw.model)} · ${S.escapeHtml(sw.location)}</div>
                </div>
                <div style="text-align:right">
                  <div class="mono small">${sw.ip}</div>
                  <div class="cell-sub">${sw.usedPorts.length} de ${sw.portCount} portas</div>
                </div>
              </div>
              <div class="card-body">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">
                  ${sw.vlans.map((vlan) => `<span class="tag">VLAN ${vlan}</span>`).join('')}
                  <span class="spacer" style="margin-left:auto"></span>
                  ${S.chip(`${Math.round((sw.usedPorts.length / sw.portCount) * 100)}% ocupado`, 'neutral')}
                </div>
                ${S.portGrid(sw)}
                <div class="conn-list">
                  ${sw.connections.slice(0, 6).map((conn) => `
                    <div class="conn-row">
                      <span class="port-tag">porta ${conn.port}</span>
                      ${dev(conn.device)}
                      <span class="spacer"></span>
                      <span class="tag">${conn.kind}</span>
                    </div>`).join('')}
                  ${sw.connections.length > 6 ? `<div class="conn-row muted small">+ ${sw.connections.length - 6} conexões</div>` : ''}
                </div>
              </div>
            </section>`;
        }).join('')}
      </div>
    `;
  };

  /* =======================================================
     Credenciais
     ======================================================= */

  const credentials = () => {
    const cc = S.credentialCounts();
    const rows = DB.credentials.map((cred) => {
      const scope = S.scopeOf(cred.serverId);
      const status = S.credentialStatus(cred);
      const search = [cred.username, scope.name, cred.owner, status.key].join(' ');
      return `
        <tr data-row data-tags="${status.key}" data-searchable="${S.escapeHtml(search)}">
          <td>
            <div class="cell-main">
              <span class="row-icon ${status.key === 'vencida' ? 'tone-danger' : status.key === 'atencao' ? 'tone-warn' : ''}">${icon('key', 14)}</span>
              <span>
                <span class="cell-title">${S.escapeHtml(cred.username)}</span>
                <span class="cell-sub">${S.escapeHtml(cred.owner)}</span>
              </span>
            </div>
          </td>
          <td>${scope.href ? `<a class="mono" href="${scope.href}" style="color:var(--accent);font-size:11.5px">${S.escapeHtml(scope.name)}</a>` : S.escapeHtml(scope.name)}</td>
          <td class="nowrap muted">${cred.rotationDays} dias</td>
          <td class="nowrap muted">${S.fmtDate(cred.lastRotatedAt)}</td>
          <td class="nowrap"><span class="mono" style="font-size:11.5px">${S.fmtDate(cred.nextDueAt)}</span></td>
          <td>${S.chip(status.short, status.tone, true)}</td>
          <td class="col-actions"><button class="btn btn-sm" data-action="open-request" data-credential="${cred.id}">Solicitar troca</button></td>
        </tr>`;
    }).join('');

    return `
      ${S.pageHead({
        title: 'Credenciais',
        subtitle: 'Agenda de troca, responsáveis e situação de cada acesso.',
        actions: `<button class="btn btn-primary" data-action="open-request">${icon('key', 15)} Solicitar troca</button>`,
      })}
      <div class="cred-note">
        ${icon('lock', 16)}
        <span><strong>Nenhuma senha é armazenada.</strong> O Nexo registra apenas o usuário, o responsável, a periodicidade e as datas de troca. Os segredos permanecem no cofre institucional.</span>
      </div>
      ${S.statStrip([
        { label: 'Vencidas', icon: 'alert', value: cc.vencida, note: '<span class="alert">exigem ação imediata</span>' },
        { label: 'A vencer', icon: 'clock', value: cc.atencao, note: 'nos próximos 30 dias' },
        { label: 'Em dia', icon: 'check', value: cc.ok, note: 'dentro da periodicidade' },
        { label: 'Senhas no site', icon: 'lock', value: 0, note: 'apenas metadados e datas' },
      ])}
      <div class="table-wrap" data-filter-scope="credentials" style="margin-top:14px">
        <div class="table-toolbar">
          ${S.searchInput('Buscar usuário ou escopo…')}
          <div class="filter-bar">
            <button class="filter-chip is-active" data-filter="todos">Todas <span class="n">${DB.credentials.length}</span></button>
            <button class="filter-chip" data-filter="vencida">Vencidas <span class="n">${cc.vencida}</span></button>
            <button class="filter-chip" data-filter="atencao">A vencer <span class="n">${cc.atencao}</span></button>
            <button class="filter-chip" data-filter="ok">Em dia <span class="n">${cc.ok}</span></button>
          </div>
          <span class="spacer"></span>
          <span class="result-count"><span data-result-count>${DB.credentials.length}</span> de ${DB.credentials.length}</span>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Credencial</th><th>Escopo</th><th>Rotação</th><th>Última troca</th><th>Próxima troca</th><th>Situação</th><th class="col-actions">Ação</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="card-foot">Trocas são registradas com solicitante, aprovador, data e observação. O segredo nunca passa pelo Nexo.</div>
      </div>
    `;
  };

  /* =======================================================
     Solicitações
     ======================================================= */

  const requests = () => {
    const counts = DB.requests.reduce((acc, req) => {
      acc.total += 1;
      if (req.status === 'Aguardando aprovação') acc.pending += 1;
      if (req.status === 'Aprovada') acc.approved += 1;
      if (req.status === 'Concluída') acc.done += 1;
      return acc;
    }, { total: 0, pending: 0, approved: 0, done: 0 });

    const rows = DB.requests.slice().sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).map((req) => {
      const cred = S.getCredential(req.credentialId);
      const scope = cred ? S.scopeOf(cred.serverId) : null;
      const tag = req.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
      const search = [req.id, cred?.username, scope?.name, req.requestedBy, req.approver, req.status].join(' ');
      return `
        <tr data-row data-tags="${tag}" data-searchable="${S.escapeHtml(search)}">
          <td>
            <div class="cell-main">
              <span class="row-icon ${req.status === 'Aguardando aprovação' ? 'tone-warn' : req.status === 'Concluída' ? 'tone-accent' : ''}">${icon('clipboard', 14)}</span>
              <span>
                <span class="cell-title" style="font-size:11.5px">${req.id}</span>
                <span class="cell-sub">${cred ? `${cred.username} · ${scope?.name || ''}` : 'Credencial removida'}</span>
              </span>
            </div>
          </td>
          <td class="nowrap">${S.escapeHtml(req.requestedBy)}<span class="cell-sub">${S.fmtDateTime(req.requestedAt)}</span></td>
          <td class="nowrap muted">${S.escapeHtml(req.approver)}</td>
          <td class="nowrap muted">${S.fmtDateTime(req.scheduledFor)}</td>
          <td>${S.requestChip(req.status)}</td>
          <td class="col-actions">
            ${req.status === 'Aguardando aprovação'
              ? `<button class="btn btn-sm btn-primary" data-action="approve-request" data-id="${req.id}" title="Aprovar como coordenação (demonstração)">Aprovar</button>
                 <button class="btn btn-sm btn-ghost" data-action="view-request" data-id="${req.id}">Detalhes</button>`
              : req.status === 'Aprovada'
                ? `<button class="btn btn-sm" data-action="complete-request" data-id="${req.id}">Concluir</button>
                   <button class="btn btn-sm btn-ghost" data-action="view-request" data-id="${req.id}">Detalhes</button>`
                : `<button class="btn btn-sm btn-ghost" data-action="view-request" data-id="${req.id}">Ver registro</button>`}
          </td>
        </tr>`;
    }).join('');

    return `
      ${S.pageHead({
        title: 'Solicitações de troca',
        subtitle: 'Fluxo com solicitação, aprovação, execução e registro de evidência.',
        actions: `<button class="btn btn-primary" data-action="open-request">${icon('plus', 15)} Nova solicitação</button>`,
      })}
      ${S.statStrip([
        { label: 'Aguardando aprovação', icon: 'clock', value: counts.pending, note: 'requerem decisão da coordenação' },
        { label: 'Aprovadas', icon: 'check', value: counts.approved, note: 'aguardando execução' },
        { label: 'Concluídas', icon: 'clipboard', value: counts.done, note: 'com evidência registrada' },
        { label: 'Tempo médio', icon: 'activity', value: '2,4', unit: 'dias', note: 'entre solicitação e conclusão' },
      ])}
      <div class="table-wrap" data-filter-scope="requests" style="margin-top:14px">
        <div class="table-toolbar">
          ${S.searchInput('Buscar solicitação ou credencial…')}
          <div class="filter-bar">
            <button class="filter-chip is-active" data-filter="todos">Todas <span class="n">${counts.total}</span></button>
            <button class="filter-chip" data-filter="aguardando-aprovacao">Aguardando <span class="n">${counts.pending}</span></button>
            <button class="filter-chip" data-filter="aprovada">Aprovadas <span class="n">${counts.approved}</span></button>
            <button class="filter-chip" data-filter="concluida">Concluídas <span class="n">${counts.done}</span></button>
          </div>
          <span class="spacer"></span>
          <span class="result-count"><span data-result-count>${counts.total}</span> de ${counts.total}</span>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Solicitação</th><th>Solicitante</th><th>Aprovador</th><th>Agendada para</th><th>Situação</th><th class="col-actions">Ação</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="card-foot">A aprovação é registrada com usuário, data e hora. Nenhuma etapa pode ser editada após a conclusão.</div>
      </div>
    `;
  };

  /* =======================================================
     Relatórios
     ======================================================= */

  const reports = () => {
    const sc = S.serviceCounts();
    const cc = S.credentialCounts();
    const envs = ['Produção', 'Infraestrutura', 'Homologação', 'Teste'].map((env) => ({
      env,
      count: DB.servers.filter((s) => s.environment === env).length,
    }));
    const totalEnvs = DB.servers.length;

    const donutParts = [
      { label: 'Em uso', value: sc['Em uso'], color: '#2b7449' },
      { label: 'Revisar', value: sc.Revisar, color: '#a76a0a' },
      { label: 'Desativar', value: sc.Desativar, color: '#a5261e' },
      { label: 'Desativado', value: sc.Desativado, color: '#b9c6c1' },
    ];
    let cursor = 0;
    const gradient = donutParts.map((part) => {
      const start = cursor;
      const end = cursor + (part.value / sc.total) * 100;
      cursor = end;
      return `${part.color} ${start}% ${end}%`;
    }).join(', ');

    const hypervisors = DB.servers.filter((s) => s.isHypervisor);

    return `
      ${S.pageHead({
        title: 'Relatórios',
        subtitle: 'Visão consolidada do inventário, dos serviços ociosos e das credenciais.',
        actions: `
          <button class="btn" data-action="print">${icon('printer', 15)} Imprimir</button>
          <button class="btn btn-primary" data-action="export" data-export="servers">${icon('download', 15)} Exportar inventário</button>
        `,
      })}

      <div class="report-grid">
        <section class="card">
          <div class="card-head"><h2>Serviços por classificação</h2><span class="sub">${sc.total} registros</span></div>
          <div class="chart-body">
            <div class="donut-wrap">
              <div class="donut" style="background:conic-gradient(${gradient})" role="img" aria-label="Serviços por classificação">
                <div class="donut-center"><strong>${sc.total}</strong><span>serviços</span></div>
              </div>
              <div class="legend" style="flex:1">
                ${donutParts.map((part) => `
                  <div class="legend-row">
                    <span class="sw" style="background:${part.color}"></span>
                    <span class="lbl">${part.label}</span>
                    <span class="val">${part.value} · ${S.percent(part.value, sc.total)}%</span>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Situação das credenciais</h2><span class="sub">${DB.credentials.length} registros</span></div>
          <div class="bars">
            <div class="bar-row">
              <div class="bar-head"><span class="lbl">Vencidas</span><span class="val">${cc.vencida} de ${DB.credentials.length}</span></div>
              <div class="bar-track"><div class="bar-fill" style="width:${S.percent(cc.vencida, DB.credentials.length)}%;background:#a5261e"></div></div>
            </div>
            <div class="bar-row">
              <div class="bar-head"><span class="lbl">A vencer em até 30 dias</span><span class="val">${cc.atencao} de ${DB.credentials.length}</span></div>
              <div class="bar-track"><div class="bar-fill" style="width:${S.percent(cc.atencao, DB.credentials.length)}%;background:#a76a0a"></div></div>
            </div>
            <div class="bar-row">
              <div class="bar-head"><span class="lbl">Em dia</span><span class="val">${cc.ok} de ${DB.credentials.length}</span></div>
              <div class="bar-track"><div class="bar-fill" style="width:${S.percent(cc.ok, DB.credentials.length)}%"></div></div>
            </div>
            <p class="small muted" style="margin-top:3px">O indicador considera a data de vencimento e a periodicidade definida para cada credencial.</p>
          </div>
        </section>
      </div>

      <div class="report-grid">
        <section class="card">
          <div class="card-head"><h2>Servidores por ambiente</h2><span class="sub">${totalEnvs} registros</span></div>
          <div class="bars">
            ${envs.map((item) => `
              <div class="bar-row">
                <div class="bar-head"><span class="lbl">${item.env}</span><span class="val">${item.count} · ${S.percent(item.count, totalEnvs)}%</span></div>
                <div class="bar-track"><div class="bar-fill" style="width:${S.percent(item.count, totalEnvs)}%"></div></div>
              </div>`).join('')}
          </div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Memória dos hypervisores</h2><span class="sub">cluster PROX-A</span></div>
          <div class="bars">
            ${hypervisors.map((hv) => `
              <div class="bar-row">
                <div class="bar-head"><span class="lbl mono" style="font-size:10.5px">${hv.hostname}</span><span class="val">${hv.capacity.ramUsed} / ${hv.capacity.ramTotal} GB</span></div>
                <div class="bar-track"><div class="bar-fill" style="width:${S.percent(hv.capacity.ramUsed, hv.capacity.ramTotal)}%"></div></div>
              </div>
              <div class="bar-row" style="margin-top:-6px">
                <div class="bar-head"><span class="lbl muted" style="font-size:10px">CPU</span><span class="val">${hv.capacity.cpu}%</span></div>
                <div class="bar-track"><div class="bar-fill" style="width:${hv.capacity.cpu}%;background:#34647a"></div></div>
              </div>`).join('')}
          </div>
        </section>
      </div>

      <section class="card" style="margin-top:14px">
        <div class="card-head"><h2>Relatórios disponíveis</h2><span class="spacer"></span><span class="sub">Exportação em CSV</span></div>
        <div class="report-list">
          <div class="report-row">
            <span class="mini-icon">${icon('server', 14)}</span>
            <span class="rr-body"><span class="rr-title">Inventário de servidores</span><span class="rr-sub">${DB.servers.length} registros · hostname, IP, SO, ambiente e responsável</span></span>
            <button class="btn btn-sm" data-action="export" data-export="servers">${icon('download', 13)} CSV</button>
          </div>
          <div class="report-row">
            <span class="mini-icon is-warn">${icon('activity', 14)}</span>
            <span class="rr-body"><span class="rr-title">Serviços ociosos</span><span class="rr-sub">${sc.Revisar + sc.Desativar} registros · serviços para revisar ou desativar</span></span>
            <button class="btn btn-sm" data-action="export" data-export="idle">${icon('download', 13)} CSV</button>
          </div>
          <div class="report-row">
            <span class="mini-icon is-danger">${icon('key', 14)}</span>
            <span class="rr-body"><span class="rr-title">Credenciais vencidas ou a vencer</span><span class="rr-sub">${cc.vencida + cc.atencao} registros · prioridade de troca</span></span>
            <button class="btn btn-sm" data-action="export" data-export="credentials">${icon('download', 13)} CSV</button>
          </div>
          <div class="report-row">
            <span class="mini-icon is-accent">${icon('shield', 14)}</span>
            <span class="rr-body"><span class="rr-title">Trilha de auditoria</span><span class="rr-sub">${DB.audit.length} registros · operações dos últimos 90 dias</span></span>
            <button class="btn btn-sm" data-action="export" data-export="audit">${icon('download', 13)} CSV</button>
          </div>
        </div>
      </section>
    `;
  };

  /* =======================================================
     Auditoria
     ======================================================= */

  const audit = () => {
    const rows = DB.audit.map((entry) => `
      <tr data-row data-searchable="${S.escapeHtml([entry.actor, entry.action, entry.entityLabel, entry.detail, entry.ip].join(' '))}">
        <td class="log-time">${S.fmtDateTime(entry.at)}</td>
        <td>
          <div class="cell-main">
            <span class="avatar sm">${userInitials(entry.actor)}</span>
            <span style="font-size:12px">${S.escapeHtml(entry.actor)}</span>
          </div>
        </td>
        <td><span class="log-action"><span class="tl-dot ${auditTone(entry.tone)}"></span>${S.escapeHtml(entry.action)}</span></td>
        <td class="mono" style="font-size:10.5px;color:var(--muted)">${S.escapeHtml(entry.entityLabel)}</td>
        <td class="log-detail">${S.escapeHtml(entry.detail)}</td>
        <td class="mono muted" style="font-size:10.5px">${S.escapeHtml(entry.ip)}</td>
      </tr>`).join('');

    return `
      ${S.pageHead({
        title: 'Auditoria',
        subtitle: 'Registro imutável das operações realizadas no Nexo.',
        actions: `<button class="btn" data-action="export" data-export="audit">${icon('download', 15)} Exportar CSV</button>`,
      })}
      <div class="table-wrap" data-filter-scope="audit">
        <div class="table-toolbar">
          ${S.searchInput('Buscar usuário ou ação…')}
          <span class="spacer"></span>
          <span class="result-count"><span data-result-count>${DB.audit.length}</span> de ${DB.audit.length}</span>
        </div>
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Data e hora</th><th>Usuário</th><th>Operação</th><th>Registro</th><th>Detalhe</th><th>IP</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <div class="immutable">${icon('lock', 13)} Registros de auditoria são somente leitura. Nenhum usuário pode editar ou excluir entradas.</div>
    `;
  };

  /* =======================================================
     Usuários
     ======================================================= */

  const users = () => {
    const active = DB.users.filter((u) => u.status === 'Ativo').length;
    const twoFactor = DB.users.filter((u) => u.twoFactor && u.status === 'Ativo').length;
    const approvers = DB.users.filter((u) => u.status === 'Ativo' && (u.role.includes('Coordenadora') || u.role.includes('Administrador')));

    const rows = DB.users.map((user) => `
      <tr>
        <td>
          <div class="user-cell">
            <span class="avatar">${user.initials}</span>
            <span><span class="u-name">${S.escapeHtml(user.name)}</span><span class="u-mail">${S.escapeHtml(user.email)}</span></span>
          </div>
        </td>
        <td>${S.chip(user.role, user.role.includes('Coordenadora') ? 'info' : user.role.includes('Auditor') ? 'neutral' : 'accent')}</td>
        <td>${user.twoFactor ? S.chip('Ativo', 'ok', true) : S.chip('Pendente', 'warn', true)}</td>
        <td class="nowrap muted">${S.lastSeen(user.lastAccess)}</td>
        <td>${S.chip(user.status, user.status === 'Ativo' ? 'ok' : 'neutral', true)}</td>
        <td class="col-actions"><button class="btn btn-sm btn-ghost" data-action="edit-user" data-id="${user.id}" aria-label="Gerenciar ${S.escapeHtml(user.name)}">${icon('dots', 15)}</button></td>
      </tr>`).join('');

    const perm = (yes) => yes ? `<span class="yes">${icon('check', 15)}</span>` : `<span class="no">${icon('x', 14)}</span>`;

    return `
      ${S.pageHead({
        title: 'Usuários e permissões',
        subtitle: 'Quem pode consultar, editar e aprovar operações no Nexo.',
        actions: `<button class="btn btn-primary" data-action="new-user">${icon('plus', 15)} Novo usuário</button>`,
      })}
      ${S.statStrip([
        { label: 'Usuários', icon: 'users', value: DB.users.length, note: `${active} ativos · 1 inativo` },
        { label: 'Autenticação em dois fatores', icon: 'shield', value: twoFactor, note: 'de 5 usuários ativos' },
        { label: 'Aprovadores', icon: 'check', value: approvers.length, note: approvers.map((u) => u.name.split(' ')[0]).join(' e ') || 'nenhum perfil ativo' },
        { label: 'Perfis de acesso', icon: 'lock', value: 4, note: 'admin, técnico, aprovador e auditor' },
      ])}
      <div class="table-wrap" style="margin-top:14px">
        <div class="table-scroll">
          <table class="data">
            <thead><tr><th>Usuário</th><th>Perfil</th><th>2FA</th><th>Último acesso</th><th>Situação</th><th class="col-actions">Ação</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="card-foot">${icon('lock', 11)} Perfis e permissões são verificados no servidor em cada operação.</div>
      </div>

      <section class="card" style="margin-top:14px">
        <div class="card-head"><h2>Matriz de permissões</h2><span class="sub">por perfil de acesso</span></div>
        <div class="table-scroll">
          <table class="matrix">
            <thead>
              <tr>
                <th>Permissão</th>
                <th style="text-align:center">Administrador</th>
                <th style="text-align:center">Técnico</th>
                <th style="text-align:center">Aprovador</th>
                <th style="text-align:center">Auditor</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Consultar inventário e relatórios</td><td class="c">${perm(true)}</td><td class="c">${perm(true)}</td><td class="c">${perm(true)}</td><td class="c">${perm(true)}</td></tr>
              <tr><td>Criar e editar servidores e serviços</td><td class="c">${perm(true)}</td><td class="c">${perm(true)}</td><td class="c">${perm(false)}</td><td class="c">${perm(false)}</td></tr>
              <tr><td>Solicitar troca de senha</td><td class="c">${perm(true)}</td><td class="c">${perm(true)}</td><td class="c">${perm(false)}</td><td class="c">${perm(false)}</td></tr>
              <tr><td>Aprovar troca ou desativação</td><td class="c">${perm(true)}</td><td class="c">${perm(false)}</td><td class="c">${perm(true)}</td><td class="c">${perm(false)}</td></tr>
              <tr><td>Gerenciar usuários e permissões</td><td class="c">${perm(true)}</td><td class="c">${perm(false)}</td><td class="c">${perm(false)}</td><td class="c">${perm(false)}</td></tr>
              <tr><td>Consultar trilha de auditoria</td><td class="c">${perm(true)}</td><td class="c">${perm(false)}</td><td class="c">${perm(true)}</td><td class="c">${perm(true)}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="card-foot">Ações destrutivas exigem confirmação, justificativa e ficam registradas com o estado anterior.</div>
      </section>
    `;
  };

  /* =======================================================
     Login
     ======================================================= */

  const login = () => {
    const rack = [
      { name: 'hv-prox01', ip: '10.10.0.5', host: true },
      { name: 'hv-prox02', ip: '10.10.0.6', host: true },
      { name: 'srv-dc01', ip: '10.10.0.10' },
      { name: 'srv-web01', ip: '10.10.0.20' },
      { name: 'srv-db01', ip: '10.10.0.30' },
      { name: 'srv-bkp01', ip: '10.10.0.50' },
    ];

    return `
      <div class="login">
        <section class="login-visual">
          <div class="login-brand">${logo}<span>Nexo</span></div>
          <div class="login-copy">
            <h1>Cada servidor, serviço e acesso em um só lugar.</h1>
            <p>O inventário que a equipe consulta antes de alterar qualquer coisa. Catálogo, revisão de serviços e agenda de senhas sem planilhas espalhadas.</p>
            <div class="rack-visual" aria-hidden="true">
              ${rack.map((unit) => `
                <div class="rack-unit ${unit.host ? 'is-host' : ''}">
                  <span class="led"></span>
                  <span class="ru-name">${unit.name}</span>
                  <span class="ru-ip">${unit.ip}</span>
                </div>`).join('')}
            </div>
          </div>
          <div class="login-foot">Uso restrito · Setor de TI · Ambiente de demonstração</div>
        </section>

        <section class="login-panel">
          <div class="login-form-wrap">
            <span class="login-eyebrow">${icon('lock', 13)} Acesso restrito</span>
            <h2>Entrar no Nexo</h2>
            <p class="sub">Use sua conta institucional para continuar.</p>
            <form class="login-form">
              <div class="field">
                <label for="login-email">E-mail institucional</label>
                <input class="input" id="login-email" type="email" value="diogo@nexo.local" autocomplete="username">
              </div>
              <div class="field">
                <label for="login-pass">Senha</label>
                <input class="input" id="login-pass" type="password" value="demonstracao" autocomplete="current-password">
              </div>
              <button class="btn btn-primary btn-block" type="submit">Entrar</button>
            </form>
            <div class="login-hint">
              ${icon('info', 13)}
              <span>Demonstração: os dados são fictícios e nenhuma credencial é enviada. Clique em <strong>Entrar</strong> para abrir o painel.</span>
            </div>
            <div class="login-meta"><span>Nexo v1.0</span><span>autenticação com 2FA</span></div>
          </div>
        </section>
      </div>
    `;
  };

  return {
    dashboard,
    servers,
    serverDetail,
    services,
    vms,
    hypervisors,
    switches,
    credentials,
    requests,
    reports,
    audit,
    users,
    login,
  };
})();
