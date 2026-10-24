/* =========================================================
   Nexo · dados de demonstração
   Todos os nomes, IPs e registros são fictícios.
   ========================================================= */

window.DB = (() => {
  const today = '2026-10-24T09:00:00';

  const currentUser = {
    id: 'u1',
    name: 'Diogo Almeida',
    role: 'Técnico de TI',
    email: 'diogo@nexo.local',
    initials: 'DA',
    twoFactor: true,
  };

  const users = [
    { id: 'u1', name: 'Diogo Almeida', role: 'Técnico de TI', email: 'diogo@nexo.local', initials: 'DA', twoFactor: true, lastAccess: '2026-10-24T08:42:00', status: 'Ativo' },
    { id: 'u2', name: 'Mariana Costa', role: 'Coordenadora de TI', email: 'mariana@nexo.local', initials: 'MC', twoFactor: true, lastAccess: '2026-10-23T15:12:00', status: 'Ativo' },
    { id: 'u3', name: 'Rafael Lima', role: 'Auditor', email: 'rafael@nexo.local', initials: 'RL', twoFactor: true, lastAccess: '2026-10-20T11:20:00', status: 'Ativo' },
    { id: 'u4', name: 'Camila Souza', role: 'Técnica de TI', email: 'camila@nexo.local', initials: 'CS', twoFactor: false, lastAccess: '2026-10-22T09:15:00', status: 'Ativo' },
    { id: 'u5', name: 'Administrador', role: 'Administrador do sistema', email: 'admin@nexo.local', initials: 'AD', twoFactor: true, lastAccess: '2026-10-18T17:05:00', status: 'Ativo' },
    { id: 'u6', name: 'Lucas Prado', role: 'Estagiário', email: 'lucas@nexo.local', initials: 'LP', twoFactor: false, lastAccess: '2026-09-02T13:40:00', status: 'Inativo' },
  ];

  const servers = [
    {
      id: 'srv-dc01', hostname: 'srv-dc01', ip: '10.10.0.10', kind: 'Físico',
      os: 'Windows Server', osVersion: '2019', purpose: 'Controlador de domínio, DNS e DHCP',
      environment: 'Infraestrutura', criticality: 'Crítica', status: 'Ativo',
      location: 'Rack A · U08', responsible: 'Diogo Almeida',
      switchId: 'sw-core01', switchPort: 'Gi1/0/12', vlan: 10, gateway: '10.10.0.1',
      mac: '00:1A:2B:3C:4D:5E', updatedAt: '2026-10-18T16:30:00',
      notes: 'Servidor de domínio principal. A senha do Administrador local está vencida e a troca precisa ser priorizada.',
    },
    {
      id: 'srv-web01', hostname: 'srv-web01', ip: '10.10.0.20', kind: 'Virtual',
      os: 'Ubuntu Server', osVersion: '22.04 LTS', purpose: 'Portal institucional e intranet',
      environment: 'Produção', criticality: 'Alta', status: 'Ativo',
      location: 'hv-prox01 · VM 101', responsible: 'Camila Souza',
      hypervisorId: 'hv-prox01', vmId: 101, vcpu: 2, ram: 4, disk: 60,
      updatedAt: '2026-10-12T10:20:00',
      notes: 'Atende o portal e a intranet. HTTPS publicado pela VPN institucional.',
    },
    {
      id: 'srv-web02', hostname: 'srv-web02', ip: '10.10.0.21', kind: 'Virtual',
      os: 'Ubuntu Server', osVersion: '22.04 LTS', purpose: 'Portal em homologação',
      environment: 'Homologação', criticality: 'Média', status: 'Ativo',
      location: 'hv-prox01 · VM 102', responsible: 'Camila Souza',
      hypervisorId: 'hv-prox01', vmId: 102, vcpu: 2, ram: 4, disk: 60,
      updatedAt: '2026-10-18T16:30:00',
      notes: 'Ambiente de homologação. O serviço FTP foi desativado em 18/10 após aprovação.',
    },
    {
      id: 'srv-db01', hostname: 'srv-db01', ip: '10.10.0.30', kind: 'Virtual',
      os: 'Debian', osVersion: '12', purpose: 'Banco PostgreSQL do sistema acadêmico',
      environment: 'Produção', criticality: 'Crítica', status: 'Ativo',
      location: 'hv-prox02 · VM 201', responsible: 'Diogo Almeida',
      hypervisorId: 'hv-prox02', vmId: 201, vcpu: 4, ram: 16, disk: 200,
      updatedAt: '2026-09-28T09:00:00',
      notes: 'Base do ERP acadêmico. A senha do usuário postgres está vencida há 41 dias.',
    },
    {
      id: 'srv-erp01', hostname: 'srv-erp01', ip: '10.10.0.31', kind: 'Virtual',
      os: 'Windows Server', osVersion: '2022', purpose: 'Sistema de gestão acadêmica',
      environment: 'Produção', criticality: 'Crítica', status: 'Ativo',
      location: 'hv-prox02 · VM 202', responsible: 'Mariana Costa',
      hypervisorId: 'hv-prox02', vmId: 202, vcpu: 4, ram: 12, disk: 160,
      updatedAt: '2026-08-25T09:00:00',
      notes: 'Aplicação acessada por alunos e professores. Compartilhamento SMB local sem finalidade documentada.',
    },
    {
      id: 'srv-file01', hostname: 'srv-file01', ip: '10.10.0.40', kind: 'Físico',
      os: 'Windows Server', osVersion: '2019', purpose: 'Compartilhamento de arquivos e perfis',
      environment: 'Produção', criticality: 'Alta', status: 'Ativo',
      location: 'Rack A · U20', responsible: 'Camila Souza',
      switchId: 'sw-core01', switchPort: 'Gi1/0/20', vlan: 20, gateway: '10.10.0.1',
      mac: '00:1A:2B:7F:10:22', updatedAt: '2026-09-10T11:00:00',
      notes: 'Perfis móveis e pastas departamentais. Backup diário para o srv-bkp01.',
    },
    {
      id: 'srv-bkp01', hostname: 'srv-bkp01', ip: '10.10.0.50', kind: 'Físico',
      os: 'Rocky Linux', osVersion: '9.2', purpose: 'Backup e retenção com Bacula',
      environment: 'Infraestrutura', criticality: 'Alta', status: 'Ativo',
      location: 'Rack B · U04', responsible: 'Diogo Almeida',
      switchId: 'sw-core02', switchPort: 'Gi1/0/12', vlan: 40, gateway: '10.10.0.1',
      mac: '00:1A:2B:5D:33:71', updatedAt: '2026-09-20T15:30:00',
      notes: 'Retenção de 30 dias em disco e cópia semanal externa. Teste de restauração pendente para este trimestre.',
    },
    {
      id: 'srv-mon01', hostname: 'srv-mon01', ip: '10.10.0.60', kind: 'Virtual',
      os: 'Ubuntu Server', osVersion: '22.04 LTS', purpose: 'Monitoramento de rede e ativos',
      environment: 'Infraestrutura', criticality: 'Média', status: 'Ativo',
      location: 'hv-prox01 · VM 103', responsible: 'Diogo Almeida',
      hypervisorId: 'hv-prox01', vmId: 103, vcpu: 2, ram: 8, disk: 80,
      updatedAt: '2026-08-30T10:00:00',
      notes: 'Zabbix. Coleta SNMP dos switches e hypervisores a cada cinco minutos.',
    },
    {
      id: 'srv-lab01', hostname: 'srv-lab01', ip: '10.10.0.70', kind: 'Virtual',
      os: 'Debian', osVersion: '12', purpose: 'Laboratório de redes',
      environment: 'Teste', criticality: 'Baixa', status: 'Ativo',
      location: 'hv-prox02 · VM 203', responsible: 'Camila Souza',
      hypervisorId: 'hv-prox02', vmId: 203, vcpu: 2, ram: 4, disk: 80,
      updatedAt: '2026-10-17T09:10:00',
      notes: 'Usado nas aulas práticas. Telnet e FTP continuam ativos sem uso desde março.',
    },
    {
      id: 'srv-old01', hostname: 'srv-old01', ip: '10.10.0.71', kind: 'Físico',
      os: 'CentOS', osVersion: '7.9', purpose: 'Sistema legado de matrícula',
      environment: 'Teste', criticality: 'Baixa', status: 'Em manutenção',
      location: 'Rack B · U14', responsible: 'Mariana Costa',
      switchId: 'sw-core02', switchPort: 'Gi1/0/8', vlan: 30, gateway: '10.10.0.1',
      mac: '00:1A:2B:44:81:0C', updatedAt: '2026-08-01T09:00:00',
      notes: 'Fora do ar para avaliação. Telnet e HTTP devem ser desativados na baixa definitiva.',
    },
    {
      id: 'hv-prox01', hostname: 'hv-prox01', ip: '10.10.0.5', kind: 'Físico',
      os: 'Proxmox VE', osVersion: '8.1.4', purpose: 'Hypervisor do cluster PROX-A',
      environment: 'Infraestrutura', criticality: 'Crítica', status: 'Ativo',
      location: 'Rack A · U02', responsible: 'Diogo Almeida',
      switchId: 'sw-core01', switchPort: 'Gi1/0/2', vlan: 10, gateway: '10.10.0.1',
      mac: '00:1A:2B:12:AA:01', updatedAt: '2026-10-02T10:15:00',
      isHypervisor: true, cluster: 'PROX-A',
      capacity: { cpu: 38, ramUsed: 20, ramTotal: 64, diskUsed: 240, diskTotal: 2000 },
      notes: 'Hospeda 3 VMs. Atualização do Proxmox planejada para novembro, em janela fora do horário letivo.',
    },
    {
      id: 'hv-prox02', hostname: 'hv-prox02', ip: '10.10.0.6', kind: 'Físico',
      os: 'Proxmox VE', osVersion: '8.1.4', purpose: 'Hypervisor do cluster PROX-A',
      environment: 'Infraestrutura', criticality: 'Crítica', status: 'Ativo',
      location: 'Rack A · U04', responsible: 'Diogo Almeida',
      switchId: 'sw-core01', switchPort: 'Gi1/0/4', vlan: 10, gateway: '10.10.0.1',
      mac: '00:1A:2B:12:AA:02', updatedAt: '2026-10-22T17:40:00',
      isHypervisor: true, cluster: 'PROX-A',
      capacity: { cpu: 51, ramUsed: 36, ramTotal: 64, diskUsed: 480, diskTotal: 2000 },
      notes: 'Hospeda 3 VMs, incluindo o banco de produção. Réplica do cluster validada em setembro.',
    },
  ];

  const services = [
    { id: 'svc-dc-dns', serverId: 'srv-dc01', name: 'DNS', protocol: 'UDP', port: 53, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-30', note: 'Resolução interna do domínio.' },
    { id: 'svc-dc-dhcp', serverId: 'srv-dc01', name: 'DHCP', protocol: 'UDP', port: 67, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-30', note: 'Distribuição de endereços das VLANs 10 e 20.' },
    { id: 'svc-dc-ldap', serverId: 'srv-dc01', name: 'LDAP', protocol: 'TCP', port: 389, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-30', note: 'Autenticação dos serviços internos.' },
    { id: 'svc-dc-rdp', serverId: 'srv-dc01', name: 'RDP', protocol: 'TCP', port: 3389, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-30', note: 'Administração restrita à VLAN de gestão.' },

    { id: 'svc-web01-https', serverId: 'srv-web01', name: 'HTTPS', protocol: 'TCP', port: 443, exposure: 'Externo', classification: 'Em uso', lastReviewed: '2026-10-12', note: 'Portal e intranet publicados pela VPN.' },
    { id: 'svc-web01-ssh', serverId: 'srv-web01', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-12', note: 'Acesso administrativo por chave.' },

    { id: 'svc-web02-https', serverId: 'srv-web02', name: 'HTTPS', protocol: 'TCP', port: 443, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-10', note: 'Homologação do portal.' },
    { id: 'svc-web02-http', serverId: 'srv-web02', name: 'HTTP', protocol: 'TCP', port: 80, exposure: 'Interno', classification: 'Revisar', lastReviewed: '2026-08-22', note: 'Redirecionamento legado; validar se ainda é necessário.' },
    { id: 'svc-web02-ssh', serverId: 'srv-web02', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-10', note: 'Acesso administrativo por chave.' },
    { id: 'svc-web02-ftp', serverId: 'srv-web02', name: 'FTP', protocol: 'TCP', port: 21, exposure: 'Interno', classification: 'Desativado', lastReviewed: '2026-10-18', note: 'Desativado após aprovação em 18/10.' },

    { id: 'svc-db-pg', serverId: 'srv-db01', name: 'PostgreSQL', protocol: 'TCP', port: 5432, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-28', note: 'Acesso restrito ao srv-erp01.' },
    { id: 'svc-db-ssh', serverId: 'srv-db01', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-28', note: 'Acesso administrativo por chave.' },

    { id: 'svc-erp-https', serverId: 'srv-erp01', name: 'HTTPS', protocol: 'TCP', port: 443, exposure: 'Externo', classification: 'Em uso', lastReviewed: '2026-10-05', note: 'Portal acadêmico.' },
    { id: 'svc-erp-rdp', serverId: 'srv-erp01', name: 'RDP', protocol: 'TCP', port: 3389, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-05', note: 'Administração restrita à VLAN de gestão.' },
    { id: 'svc-erp-smb', serverId: 'srv-erp01', name: 'SMB', protocol: 'TCP', port: 445, exposure: 'Interno', classification: 'Revisar', lastReviewed: '2026-07-14', note: 'Compartilhamento local sem finalidade documentada.' },

    { id: 'svc-file-smb', serverId: 'srv-file01', name: 'SMB', protocol: 'TCP', port: 445, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-01', note: 'Pastas departamentais e perfis móveis.' },
    { id: 'svc-file-rdp', serverId: 'srv-file01', name: 'RDP', protocol: 'TCP', port: 3389, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-01', note: 'Administração restrita à VLAN de gestão.' },

    { id: 'svc-bkp-ssh', serverId: 'srv-bkp01', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-20', note: 'Acesso administrativo por chave.' },
    { id: 'svc-bkp-https', serverId: 'srv-bkp01', name: 'HTTPS', protocol: 'TCP', port: 443, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-20', note: 'Painel do Bacula.' },

    { id: 'svc-mon-https', serverId: 'srv-mon01', name: 'HTTPS', protocol: 'TCP', port: 443, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-08', note: 'Painel do Zabbix.' },
    { id: 'svc-mon-snmp', serverId: 'srv-mon01', name: 'SNMP', protocol: 'UDP', port: 161, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-08', note: 'Coleta dos switches e hypervisores.' },
    { id: 'svc-mon-ssh', serverId: 'srv-mon01', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-08', note: 'Acesso administrativo por chave.' },

    { id: 'svc-lab-ssh', serverId: 'srv-lab01', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-09-15', note: 'Acesso dos alunos durante as aulas.' },
    { id: 'svc-lab-telnet', serverId: 'srv-lab01', name: 'Telnet', protocol: 'TCP', port: 23, exposure: 'Interno', classification: 'Desativar', lastReviewed: '2026-03-12', note: 'Protocolo sem criptografia; substituído por SSH.' },
    { id: 'svc-lab-ftp', serverId: 'srv-lab01', name: 'FTP', protocol: 'TCP', port: 21, exposure: 'Interno', classification: 'Revisar', lastReviewed: '2026-03-12', note: 'Usado apenas em aula; avaliar desativação.' },

    { id: 'svc-old-http', serverId: 'srv-old01', name: 'HTTP', protocol: 'TCP', port: 80, exposure: 'Interno', classification: 'Revisar', lastReviewed: '2025-11-20', note: 'Aplicação legada em avaliação.' },
    { id: 'svc-old-telnet', serverId: 'srv-old01', name: 'Telnet', protocol: 'TCP', port: 23, exposure: 'Interno', classification: 'Desativar', lastReviewed: '2025-11-20', note: 'Acesso remoto legado sem criptografia.' },

    { id: 'svc-hv1-web', serverId: 'hv-prox01', name: 'Interface web', protocol: 'TCP', port: 8006, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-02', note: 'Painel de administração do Proxmox.' },
    { id: 'svc-hv1-ssh', serverId: 'hv-prox01', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-02', note: 'Acesso administrativo por chave.' },

    { id: 'svc-hv2-web', serverId: 'hv-prox02', name: 'Interface web', protocol: 'TCP', port: 8006, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-02', note: 'Painel de administração do Proxmox.' },
    { id: 'svc-hv2-ssh', serverId: 'hv-prox02', name: 'SSH', protocol: 'TCP', port: 22, exposure: 'Interno', classification: 'Em uso', lastReviewed: '2026-10-02', note: 'Acesso administrativo por chave.' },
  ];

  const credentials = [
    { id: 'cred-01', serverId: 'srv-dc01', username: 'Administrator', rotationDays: 90, lastRotatedAt: '2026-07-12', nextDueAt: '2026-10-10', owner: 'Diogo Almeida' },
    { id: 'cred-02', serverId: 'srv-dc01', username: 'svc-backup', rotationDays: 180, lastRotatedAt: '2026-09-16', nextDueAt: '2027-03-15', owner: 'Diogo Almeida' },
    { id: 'cred-03', serverId: 'srv-web01', username: 'root', rotationDays: 90, lastRotatedAt: '2026-09-02', nextDueAt: '2026-12-01', owner: 'Camila Souza' },
    { id: 'cred-04', serverId: 'srv-web02', username: 'deploy', rotationDays: 90, lastRotatedAt: '2026-08-22', nextDueAt: '2026-11-20', owner: 'Camila Souza' },
    { id: 'cred-05', serverId: 'srv-db01', username: 'postgres', rotationDays: 90, lastRotatedAt: '2026-06-15', nextDueAt: '2026-09-13', owner: 'Diogo Almeida' },
    { id: 'cred-06', serverId: 'srv-db01', username: 'root', rotationDays: 90, lastRotatedAt: '2026-08-20', nextDueAt: '2026-11-18', owner: 'Diogo Almeida' },
    { id: 'cred-07', serverId: 'srv-erp01', username: 'Administrator', rotationDays: 90, lastRotatedAt: '2026-08-01', nextDueAt: '2026-10-30', owner: 'Mariana Costa' },
    { id: 'cred-08', serverId: 'srv-erp01', username: 'svc-erp', rotationDays: 180, lastRotatedAt: '2026-06-25', nextDueAt: '2026-12-22', owner: 'Mariana Costa' },
    { id: 'cred-09', serverId: 'srv-file01', username: 'Administrator', rotationDays: 90, lastRotatedAt: '2026-09-16', nextDueAt: '2026-12-15', owner: 'Camila Souza' },
    { id: 'cred-10', serverId: 'srv-bkp01', username: 'root', rotationDays: 90, lastRotatedAt: '2026-08-07', nextDueAt: '2026-11-05', owner: 'Diogo Almeida' },
    { id: 'cred-11', serverId: 'srv-mon01', username: 'root', rotationDays: 90, lastRotatedAt: '2026-07-03', nextDueAt: '2026-10-01', owner: 'Diogo Almeida' },
    { id: 'cred-12', serverId: 'srv-lab01', username: 'root', rotationDays: 90, lastRotatedAt: '2026-10-12', nextDueAt: '2027-01-10', owner: 'Camila Souza' },
    { id: 'cred-13', serverId: 'hv-prox01', username: 'root', rotationDays: 120, lastRotatedAt: '2026-08-22', nextDueAt: '2026-12-20', owner: 'Diogo Almeida' },
    { id: 'cred-14', serverId: 'hv-prox02', username: 'root', rotationDays: 120, lastRotatedAt: '2026-07-04', nextDueAt: '2026-11-01', owner: 'Diogo Almeida' },
    { id: 'cred-15', serverId: 'sw-core01', username: 'admin', rotationDays: 60, lastRotatedAt: '2026-08-29', nextDueAt: '2026-10-28', owner: 'Diogo Almeida' },
  ];

  const requests = [
    {
      id: 'REQ-018', credentialId: 'cred-05', requestedBy: 'Diogo Almeida', requestedAt: '2026-10-23T14:20:00',
      approver: 'Mariana Costa', status: 'Aguardando aprovação', scheduledFor: '2026-10-27T18:00:00',
      note: 'Rotação atrasada há 41 dias. Troca precisa ocorrer antes do fechamento contábil.',
    },
    {
      id: 'REQ-017', credentialId: 'cred-15', requestedBy: 'Diogo Almeida', requestedAt: '2026-10-22T10:05:00',
      approver: 'Mariana Costa', status: 'Aprovada', scheduledFor: '2026-10-26T18:00:00',
      approvedAt: '2026-10-23T15:12:00',
      note: 'Janela fora do horário letivo, com acompanhamento da coordenação.',
    },
    {
      id: 'REQ-016', credentialId: 'cred-01', requestedBy: 'Diogo Almeida', requestedAt: '2026-10-20T09:10:00',
      approver: 'Mariana Costa', status: 'Concluída', scheduledFor: '2026-10-22T18:00:00',
      approvedAt: '2026-10-21T10:00:00', completedAt: '2026-10-22T18:24:00',
      note: 'Troca realizada no console do domínio. Próxima troca em 20/01/2027.',
    },
    {
      id: 'REQ-015', credentialId: 'cred-10', requestedBy: 'Diogo Almeida', requestedAt: '2026-10-13T09:30:00',
      approver: 'Mariana Costa', status: 'Concluída', scheduledFor: '2026-10-15T18:00:00',
      approvedAt: '2026-10-14T09:00:00', completedAt: '2026-10-15T18:50:00',
      note: 'Troca registrada com evidência anexada ao processo.',
    },
    {
      id: 'REQ-014', credentialId: 'cred-08', requestedBy: 'Diogo Almeida', requestedAt: '2026-10-07T11:40:00',
      approver: 'Mariana Costa', status: 'Concluída', scheduledFor: '2026-10-09T18:00:00',
      approvedAt: '2026-10-08T08:50:00', completedAt: '2026-10-09T18:30:00',
      note: 'Conta de serviço do ERP. Aplicação reiniciada após a troca.',
    },
  ];

  const switches = [
    {
      id: 'sw-core01', name: 'sw-core01', model: 'Cisco Catalyst 2960X-24TS', ip: '10.10.0.2',
      location: 'Rack A · U01', portCount: 24, uplinkPort: 24,
      usedPorts: [2, 4, 8, 12, 18, 20, 24], vlans: [10, 20, 30],
      connections: [
        { port: 2, device: 'hv-prox01', kind: 'Hypervisor' },
        { port: 4, device: 'hv-prox02', kind: 'Hypervisor' },
        { port: 8, device: 'Impressora RH', kind: 'Impressora' },
        { port: 12, device: 'srv-dc01', kind: 'Servidor' },
        { port: 18, device: 'AP-Piso1', kind: 'Access point' },
        { port: 20, device: 'srv-file01', kind: 'Servidor' },
        { port: 24, device: 'sw-core02', kind: 'Uplink' },
      ],
    },
    {
      id: 'sw-core02', name: 'sw-core02', model: 'Cisco Catalyst 2960X-24TS', ip: '10.10.0.3',
      location: 'Rack B · U01', portCount: 24, uplinkPort: 1,
      usedPorts: [1, 6, 8, 12, 16], vlans: [10, 20, 40],
      connections: [
        { port: 1, device: 'sw-core01', kind: 'Uplink' },
        { port: 6, device: 'AP-Piso2', kind: 'Access point' },
        { port: 8, device: 'srv-old01', kind: 'Servidor' },
        { port: 12, device: 'srv-bkp01', kind: 'Servidor' },
        { port: 16, device: 'Câmera corredor', kind: 'Câmera IP' },
      ],
    },
    {
      id: 'sw-lab01', name: 'sw-lab01', model: 'TP-Link TL-SG1024', ip: '10.10.0.4',
      location: 'Sala 12 · bancada', portCount: 24, uplinkPort: 24,
      usedPorts: [1, 3, 4, 5, 7, 9, 11, 24], vlans: [30, 99],
      connections: [
        { port: 1, device: 'Bancada 01', kind: 'Estação' },
        { port: 3, device: 'Bancada 02', kind: 'Estação' },
        { port: 4, device: 'Bancada 03', kind: 'Estação' },
        { port: 5, device: 'Bancada 04', kind: 'Estação' },
        { port: 7, device: 'AP Sala 12', kind: 'Access point' },
        { port: 9, device: 'Impressora laboratório', kind: 'Impressora' },
        { port: 11, device: 'Bancada 05', kind: 'Estação' },
        { port: 24, device: 'sw-core01', kind: 'Uplink' },
      ],
    },
  ];

  const audit = [
    { id: 'a01', at: '2026-10-24T08:42:00', actor: 'Diogo Almeida', action: 'Sessão iniciada', entityType: 'Sistema', entityId: 'sistema', entityLabel: 'Nexo', detail: 'Autenticação com segundo fator.', ip: '10.10.1.42', tone: 'accent' },
    { id: 'a02', at: '2026-10-23T16:05:00', actor: 'Diogo Almeida', action: 'Solicitou troca de senha', entityType: 'Credencial', entityId: 'cred-05', entityLabel: 'postgres · srv-db01', detail: 'Solicitação REQ-018 aguardando aprovação.', ip: '10.10.1.42', tone: 'warn', serverId: 'srv-db01' },
    { id: 'a03', at: '2026-10-23T15:12:00', actor: 'Mariana Costa', action: 'Aprovou solicitação', entityType: 'Solicitação', entityId: 'REQ-017', entityLabel: 'REQ-017 · admin · sw-core01', detail: 'Janela agendada para 26/10 às 18:00.', ip: '10.10.1.10', tone: 'accent' },
    { id: 'a04', at: '2026-10-23T10:30:00', actor: 'Diogo Almeida', action: 'Classificou serviço', entityType: 'Serviço', entityId: 'svc-lab-telnet', entityLabel: 'Telnet · srv-lab01', detail: "Classificação alterada de 'Revisar' para 'Desativar'.", ip: '10.10.1.42', tone: 'warn', serverId: 'srv-lab01' },
    { id: 'a05', at: '2026-10-22T17:40:00', actor: 'Diogo Almeida', action: 'Atualizou ficha do servidor', entityType: 'Servidor', entityId: 'srv-web02', entityLabel: 'srv-web02', detail: 'Finalidade e responsável revisados.', ip: '10.10.1.42', tone: 'neutral', serverId: 'srv-web02' },
    { id: 'a06', at: '2026-10-22T18:24:00', actor: 'Diogo Almeida', action: 'Concluiu troca de senha', entityType: 'Solicitação', entityId: 'REQ-016', entityLabel: 'REQ-016 · Administrator · srv-dc01', detail: 'Próxima troca recalculada para 20/01/2027.', ip: '10.10.1.42', tone: 'accent', serverId: 'srv-dc01' },
    { id: 'a07', at: '2026-10-21T14:02:00', actor: 'Mariana Costa', action: 'Alterou permissões', entityType: 'Usuário', entityId: 'u4', entityLabel: 'Camila Souza', detail: 'Papel alterado para Técnica de TI.', ip: '10.10.1.10', tone: 'neutral' },
    { id: 'a08', at: '2026-10-20T11:20:00', actor: 'Rafael Lima', action: 'Exportou relatório', entityType: 'Relatório', entityId: 'rep-02', entityLabel: 'Serviços ociosos', detail: 'Formato CSV · 6 registros.', ip: '10.10.1.77', tone: 'neutral' },
    { id: 'a09', at: '2026-10-18T16:30:00', actor: 'Mariana Costa', action: 'Aprovou desativação', entityType: 'Serviço', entityId: 'svc-web02-ftp', entityLabel: 'FTP · srv-web02', detail: 'Serviço desativado após validação técnica.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-web02' },
    { id: 'a10', at: '2026-10-17T09:10:00', actor: 'Diogo Almeida', action: 'Cadastrou máquina virtual', entityType: 'Servidor', entityId: 'srv-lab01', entityLabel: 'srv-lab01', detail: 'VM 203 criada no hypervisor hv-prox02.', ip: '10.10.1.42', tone: 'accent', serverId: 'srv-lab01' },
    { id: 'a11', at: '2026-10-15T18:50:00', actor: 'Diogo Almeida', action: 'Concluiu troca de senha', entityType: 'Solicitação', entityId: 'REQ-015', entityLabel: 'REQ-015 · root · srv-bkp01', detail: 'Próxima troca recalculada para 05/11/2026.', ip: '10.10.1.42', tone: 'accent', serverId: 'srv-bkp01' },
    { id: 'a12', at: '2026-10-12T14:10:00', actor: 'Diogo Almeida', action: 'Atualizou credencial', entityType: 'Credencial', entityId: 'cred-12', entityLabel: 'root · srv-lab01', detail: 'Troca registrada fora do Nexo; evidência anexada.', ip: '10.10.1.42', tone: 'neutral', serverId: 'srv-lab01' },
    { id: 'a13', at: '2026-10-02T10:15:00', actor: 'Diogo Almeida', action: 'Atualizou ficha do servidor', entityType: 'Servidor', entityId: 'hv-prox02', entityLabel: 'hv-prox02', detail: 'Versão do Proxmox confirmada e capacidade revisada.', ip: '10.10.1.42', tone: 'neutral', serverId: 'hv-prox02' },
    { id: 'a14', at: '2026-09-28T09:00:00', actor: 'Diogo Almeida', action: 'Revisou serviços', entityType: 'Servidor', entityId: 'srv-db01', entityLabel: 'srv-db01', detail: '2 serviços revisados e mantidos em uso.', ip: '10.10.1.42', tone: 'neutral', serverId: 'srv-db01' },
    { id: 'a15', at: '2026-09-20T15:30:00', actor: 'Diogo Almeida', action: 'Atualizou ficha do servidor', entityType: 'Servidor', entityId: 'srv-bkp01', entityLabel: 'srv-bkp01', detail: 'Rotina de retenção documentada.', ip: '10.10.1.42', tone: 'neutral', serverId: 'srv-bkp01' },
    { id: 'a16', at: '2026-09-15T08:40:00', actor: 'Camila Souza', action: 'Revisou serviços', entityType: 'Servidor', entityId: 'srv-web01', entityLabel: 'srv-web01', detail: 'Serviços revisados e classificados.', ip: '10.10.1.55', tone: 'neutral', serverId: 'srv-web01' },
    { id: 'a17', at: '2026-09-10T11:00:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-file01', entityLabel: 'srv-file01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-file01' },
    { id: 'a18', at: '2026-08-30T10:00:00', actor: 'Diogo Almeida', action: 'Atualizou ficha do servidor', entityType: 'Servidor', entityId: 'srv-mon01', entityLabel: 'srv-mon01', detail: 'Coleta SNMP documentada.', ip: '10.10.1.42', tone: 'neutral', serverId: 'srv-mon01' },
    { id: 'a19', at: '2026-08-25T09:00:00', actor: 'Diogo Almeida', action: 'Atualizou ficha do servidor', entityType: 'Servidor', entityId: 'srv-erp01', entityLabel: 'srv-erp01', detail: 'Responsável e finalidade revisados.', ip: '10.10.1.42', tone: 'neutral', serverId: 'srv-erp01' },
    { id: 'a20', at: '2026-08-01T09:00:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-old01', entityLabel: 'srv-old01', detail: 'Equipamento legado incluído para avaliação.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-old01' },
    { id: 'a21', at: '2026-08-01T09:05:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'hv-prox01', entityLabel: 'hv-prox01', detail: 'Hypervisor incluído no inventário.', ip: '10.10.1.10', tone: 'accent', serverId: 'hv-prox01' },
    { id: 'a22', at: '2026-07-30T10:00:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-dc01', entityLabel: 'srv-dc01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-dc01' },
    { id: 'a23', at: '2026-07-30T10:04:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-web01', entityLabel: 'srv-web01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-web01' },
    { id: 'a24', at: '2026-07-30T10:08:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-web02', entityLabel: 'srv-web02', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-web02' },
    { id: 'a25', at: '2026-07-30T10:12:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-db01', entityLabel: 'srv-db01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-db01' },
    { id: 'a26', at: '2026-07-30T10:16:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-erp01', entityLabel: 'srv-erp01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-erp01' },
    { id: 'a27', at: '2026-07-30T10:20:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-bkp01', entityLabel: 'srv-bkp01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-bkp01' },
    { id: 'a28', at: '2026-07-30T10:24:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-mon01', entityLabel: 'srv-mon01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-mon01' },
    { id: 'a29', at: '2026-07-30T10:28:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'hv-prox02', entityLabel: 'hv-prox02', detail: 'Hypervisor incluído no inventário.', ip: '10.10.1.10', tone: 'accent', serverId: 'hv-prox02' },
    { id: 'a30', at: '2026-07-30T10:32:00', actor: 'Mariana Costa', action: 'Cadastrou servidor', entityType: 'Servidor', entityId: 'srv-lab01', entityLabel: 'srv-lab01', detail: 'Ficha inicial criada no catálogo.', ip: '10.10.1.10', tone: 'accent', serverId: 'srv-lab01' },
  ];

  const notifications = [
    { title: '3 credenciais vencidas', sub: 'Revisar a agenda de troca de senhas', href: '#/credenciais?situacao=vencida', tone: 'danger' },
    { title: '1 solicitação aguardando aprovação', sub: 'REQ-018 · postgres · srv-db01', href: '#/solicitacoes', tone: 'warn' },
    { title: '2 serviços marcados para desativar', sub: 'Telnet em srv-lab01 e srv-old01', href: '#/servicos?classe=Desativar', tone: 'warn' },
  ];

  return {
    today,
    currentUser,
    users,
    servers,
    services,
    credentials,
    requests,
    switches,
    audit,
    notifications,
  };
})();
