# Nexo · Central de Infraestrutura

Mock navegável de um site para centralizar servidores, serviços, máquinas virtuais, hypervisores, switches e a agenda de troca de senhas da infraestrutura de TI.

O projeto é uma demonstração estática: não tem backend, banco de dados nem integração real. Todos os nomes, IPs e registros são fictícios.

## Como abrir

Abra o arquivo `index.html` diretamente no navegador. O site funciona sem servidor e sem instalar nada.

Se preferir servir por HTTP:

```bash
cd /home/yuri/Projects/gestao
python3 -m http.server 8765
```

Depois acesse `http://localhost:8765`.

Recomendado: navegador em tela cheia, com zoom em 100%, em uma resolução de 1366 px ou mais.

## Roteiro de demonstração

1. **Painel** — apresente os indicadores: 12 servidores, 6 VMs, 31 serviços e as 3 credenciais vencidas. Mostre as listas de pendências e a ocupação dos hypervisores.
2. **Servidores** — abra a ficha do `srv-dc01` e percorra as abas: dados gerais, serviços, credenciais, rede e histórico. Repare no cabeçalho em formato de etiqueta de rack.
3. **Serviços** — filtre por “Revisar” e mostre o Telnet e o FTP sem uso. Use “Marcar revisado” para demonstrar o registro da decisão.
4. **Switches** — mostre o mapa de portas do `sw-core01`, com uplink e portas em uso, e abra o `srv-file01` a partir da conexão.
5. **Credenciais e solicitações** — mostre o aviso de que nenhuma senha é armazenada, solicite uma troca (o formulário abre com a credencial mais urgente), aprove a solicitação e conclua a troca. A próxima data é recalculada automaticamente.
6. **Auditoria e relatórios** — mostre o registro imutável das ações, a matriz de permissões e a exportação CSV de um relatório.

Atalhos: `Ctrl + K` (ou `⌘ + K`) abre a busca global; `/` foca a busca da página; `Esc` fecha diálogos.

A tela de login é acessada pelo menu do usuário, no canto superior direito → **Sair**. Qualquer senha é aceita na demonstração.

## O que está implementado

- Navegação entre painel, inventário, acesso e governança.
- Busca global com servidores, serviços, credenciais e páginas.
- Filtros e busca em todas as listas.
- Ficha de servidor com abas e relações entre switch, host, hypervisor, VM, serviço e credencial.
- Mapa visual de portas dos switches.
- Cadastro e edição de servidores, além de cadastro e gerenciamento de usuários.
- Fluxo de solicitação → aprovação → conclusão de troca de senha, com recálculo da próxima data.
- Exportação CSV dos relatórios e impressão da página.
- Layout responsivo até celular.

## O que ficou fora do escopo

- Login real e autenticação em dois fatores.
- Persistência: recarregar a página devolve os dados ao estado inicial.
- Armazenamento de senhas ou integração com cofre.
- Integração com Proxmox, switches ou qualquer equipamento.
- Monitoramento em tempo real e desativação automática de serviços.

## Estrutura

```
index.html
assets/
  css/app.css        estilos e sistema visual
  js/data.js         dados fictícios da demonstração
  js/icons.js        ícones em SVG
  js/ui.js           componentes, datas, modais, toasts e busca global
  js/views.js        telas
  js/app.js          navegação, filtros e ações
  fonts/             Archivo e IBM Plex Mono
```

Para ajustar o conteúdo, edite `assets/js/data.js`. Para mudar a direção visual, os tokens de cor, tipografia e espaçamento estão no topo de `assets/css/app.css`.
