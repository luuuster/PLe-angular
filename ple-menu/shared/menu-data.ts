/**
 * PLe Menu Data — Dados do menu sidebar
 * Compatível com PrimeNG 9 MenuItem interface
 *
 * Migrado de: app.component.ts > iniciarMenu()
 * Mantém a mesma estrutura MenuItem[] do PrimeNG
 */
import { MenuItem } from 'primeng/api';

export interface PleMenuItem extends MenuItem {
  /** Ícone PrimeIcons (pi pi-xxx) */
  icon?: string;
  /** Ícone Material Icons (fallback legado) */
  materialIcon?: string;
  /** Permissões necessárias para exibir */
  roles?: string[];
  /** Sub-items */
  items?: PleMenuItem[];
  /** ID único para controle de estado */
  menuId?: string;
  /** Indica se é item de comando (abre dialog) vs navegação */
  isCommand?: boolean;
}

/**
 * Gera o array de menu items.
 * Recebe o AuthorizationService e funções de callback para manter
 * a mesma lógica de visibilidade do iniciarMenu() original.
 */
export function buildMenuItems(
  authService: { hasRole: (roles: string[]) => boolean },
  callbacks: {
    abrirBlocoAcompanhamento: () => void;
    abrirBlocoAssinatura: () => void;
    exibirCadastroVideNorma: () => void;
    exibirCadastroVideAto: () => void;
    siglaUnidade: string;
    tipoUnidadeLogada: string;
  },
  urls: any,
  permissoes: any
): PleMenuItem[] {
  const P = permissoes;
  const U = urls;
  const has = (roles: string[]) => authService.hasRole(roles);

  return [
    {
      menuId: 'configuracoes',
      label: 'Configurações',
      icon: 'pi pi-cog',
      routerLink: [`/${U.CONFIGURACOES}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.UNIDADE_LISTAR])
    },
    {
      menuId: 'unidade',
      label: 'Unidade',
      icon: 'pi pi-building',
      routerLink: [`/${U.UNIDADE}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.UNIDADE_LISTAR]),
      items: [
        {
          menuId: 'orgaos-legislativos',
          label: 'Órgãos Legislativos',
          icon: 'pi pi-sitemap',
          routerLink: [`/${U.ORGAO_LEGISLATIVO}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.COMISSAO_LISTAR])
        }
      ]
    },
    {
      menuId: 'usuario',
      label: 'Usuário',
      icon: 'pi pi-user',
      routerLink: [`/${U.USUARIO}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.USUARIO_LISTAR])
    },
    {
      menuId: 'perfil-permissoes',
      label: 'Perfil Permissões',
      icon: 'pi pi-shield',
      routerLink: [`/${U.PERMISSAO}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.PERMISSAO_LISTAR])
    },
    {
      menuId: 'documentos',
      label: 'Documentos',
      icon: 'pi pi-file',
      visible: has([P.ADMINISTRAR_SISTEMA, P.TIPO_DOCUMENTO_LISTAR,
        P.MODELO_DOCUMENTO_LISTAR, P.TIPO_ASSUNTO_LISTAR, P.HIPOTESE_LEGAL_LISTAR]),
      items: [
        {
          menuId: 'tipos-documento',
          label: 'Tipos',
          icon: 'pi pi-list',
          routerLink: [`/${U.TIPO_DOCUMENTO}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.TIPO_DOCUMENTO_LISTAR])
        },
        {
          menuId: 'modelos-documento',
          label: 'Modelos',
          icon: 'pi pi-copy',
          routerLink: [`/${U.MODELO_DOCUMENTO}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.MODELO_DOCUMENTO_LISTAR])
        },
        {
          menuId: 'assuntos',
          label: 'Assuntos',
          icon: 'pi pi-bookmark',
          routerLink: [`/${U.TIPO_ASSUNTO}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.TIPO_ASSUNTO_LISTAR])
        },
        {
          menuId: 'hipotese-legal',
          label: 'Hipótese Legal',
          icon: 'pi pi-info-circle',
          routerLink: [`/${U.HIPOTESE_LEGAL}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.HIPOTESE_LEGAL_LISTAR])
        }
      ]
    },
    {
      menuId: 'proposicoes',
      label: 'Proposições',
      icon: 'pi pi-file-edit',
      routerLink: [`/${U.PROPOSICAO}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.PROPOSICAO_LISTAR,
        P.TIPO_PROPOSICAO_LISTAR, P.DISPONIBILIZACAO_LISTAR, P.MARCADOR_LISTAR]),
      items: [
        {
          menuId: 'tipos-proposicao',
          label: 'Tipos',
          icon: 'pi pi-list',
          routerLink: [`/${U.TIPO_PROPOSICAO}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.TIPO_PROPOSICAO_LISTAR])
        },
        {
          menuId: 'disponibilizacoes',
          label: 'Disponibilizações',
          icon: 'pi pi-share-alt',
          routerLink: [`/${U.DISPONIBILIZACAO}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.DISPONIBILIZACAO_LISTAR])
        },
        {
          menuId: 'marcadores',
          label: 'Marcadores',
          icon: 'pi pi-tag',
          routerLink: [`/${U.MARCADOR}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.MARCADOR_LISTAR])
        },
        {
          menuId: 'modelos-doc-unidade',
          label: 'Modelos de Documentos da Unidade',
          icon: 'pi pi-file-o',
          routerLink: [`/${U.MODELO_DOCUMENTO_UNIDADE}`],
          visible: has([P.ADMINISTRAR_SISTEMA])
        }
      ]
    },
    {
      menuId: 'ideias-legislativas',
      label: 'Ideias Legislativas',
      icon: 'pi pi-lightbulb',
      routerLink: [`/${U.IDEIA_LEGISATIVA}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.IDEIA_LEGISLATIVA_LISTAR])
    },
    {
      menuId: 'acompanhamento',
      label: 'Acompanhamento de Proposição',
      icon: 'pi pi-eye',
      isCommand: true,
      command: () => callbacks.abrirBlocoAcompanhamento(),
      visible: has([P.ADMINISTRAR_SISTEMA, P.BLOCO_PROCESSO])
    },
    {
      menuId: 'blocos-assinatura',
      label: 'Blocos de Assinatura',
      icon: 'pi pi-pencil',
      isCommand: true,
      command: () => callbacks.abrirBlocoAssinatura(),
      visible: has([P.ADMINISTRAR_SISTEMA, P.BLOCO_ASSINATURA_LISTAR])
    },
    {
      menuId: 'documentos-sessao',
      label: 'Documentos da Sessão',
      icon: 'pi pi-folder-open',
      routerLink: [`/${U.DOCUMENTOS_SESSSAO}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.DOCUMENTOS_SESSAO_VISUALIZAR])
    },
    {
      menuId: 'normas',
      label: 'Normas',
      icon: 'pi pi-book',
      routerLink: [`/${U.NORMA}/`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.NORMA_LISTAR]),
      items: [
        {
          menuId: 'vides-norma',
          label: 'Vides',
          icon: 'pi pi-link',
          isCommand: true,
          command: () => callbacks.exibirCadastroVideNorma(),
          visible: has([P.ADMINISTRAR_SISTEMA, P.NORMA_INCLUIR])
        }
      ]
    },
    {
      menuId: 'atos-administrativos',
      label: 'Atos Administrativos',
      icon: 'pi pi-briefcase',
      routerLink: [`/${U.ATO_ADMINISTRATIVO}/`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.ATO_ADMINISTRATIVO_LISTAR]),
      items: [
        {
          menuId: 'vides-ato',
          label: 'Vides',
          icon: 'pi pi-link',
          isCommand: true,
          command: () => callbacks.exibirCadastroVideAto(),
          visible: has([P.ADMINISTRAR_SISTEMA, P.NORMA_INCLUIR])
        },
        {
          menuId: 'tipos-ato',
          label: 'Tipos de Atos',
          icon: 'pi pi-tags',
          routerLink: [`/${U.ATO_ADMINISTRATIVO}/tipos`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.TIPO_ATO_ADMINISTRATIVO_LISTAR])
        }
      ]
    },
    {
      menuId: 'descritores',
      label: 'Descritores',
      icon: 'pi pi-database',
      routerLink: [`/${U.DESCRITOR}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.DESCRITOR_LISTAR])
    },
    {
      menuId: 'fontes',
      label: 'Fontes',
      icon: 'pi pi-clone',
      routerLink: [`/${U.PUBLICACAO_DIARIO}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.PUBLICACAO_DIARIO_LISTAR])
    },
    {
      menuId: 'autoria',
      label: 'Autoria',
      icon: 'pi pi-users',
      routerLink: [`/${U.AUTOR}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.AUTORIA_LISTAR])
    },
    {
      menuId: 'partidos',
      label: 'Partidos Políticos',
      icon: 'pi pi-flag',
      routerLink: [`/${U.PARTIDOS_POLITICOS}`],
      visible: has([P.ADMINISTRAR_SISTEMA])
    },
    {
      menuId: 'assinaturas',
      label: 'Assinaturas',
      icon: 'pi pi-check-square',
      routerLink: [`/${U.ASSINATURA}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.ASSINATURA_LISTAR])
    },
    {
      menuId: 'auditoria',
      label: 'Auditoria',
      icon: 'pi pi-search',
      routerLink: [`/${U.AUDITORIA}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.AUDITORIA_LISTAR])
    },
    {
      menuId: 'analise-assessoria',
      label: 'Análise Assessoria',
      icon: 'pi pi-chart-bar',
      routerLink: [`/${U.PROPOSICAO_ANALISE_USUARIO}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.ANALISE_ASSESSORIA_INCLUIR])
    },
    {
      menuId: 'indicadores',
      label: 'Indicadores',
      icon: 'pi pi-chart-line',
      routerLink: [`/${U.INDICADOR}`],
      visible: has([P.ADMINISTRAR_SISTEMA, P.INDICADOR_VISUALIZAR])
    },
    {
      menuId: 'plenario-virtual',
      label: 'Plenário Virtual',
      icon: 'pi pi-desktop',
      visible: has([P.ADMINISTRAR_SISTEMA, P.ORDEM_DIA_GERENCIAR]),
      items: [
        {
          menuId: 'ordem-dia',
          label: 'Ordem do Dia',
          icon: 'pi pi-calendar',
          routerLink: [`/${U.ORDEM_DIA}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.ORDEM_DIA_LISTAR])
        },
        {
          menuId: 'sessoes',
          label: 'Sessões',
          icon: 'pi pi-video',
          routerLink: [`/${U.SESSAO}`],
          visible: has([P.ADMINISTRAR_SISTEMA, P.SESSAO_LISTAR])
        }
      ]
    },
    {
      menuId: 'reunioes',
      label: `Reuniões da ${callbacks.siglaUnidade}`,
      icon: 'pi pi-comments',
      visible: callbacks.tipoUnidadeLogada === 'COMISSAO',
      items: [
        {
          menuId: 'pauta-reuniao',
          label: 'Pauta de Reunião',
          icon: 'pi pi-calendar-plus',
          routerLink: [`/${U.PAUTA_REUNIAO}`]
        },
        {
          menuId: 'reunioes-comissao',
          label: 'Reuniões da Comissão',
          icon: 'pi pi-users',
          routerLink: [`/${U.REUNIOES}`]
        }
      ]
    }
  ];
}
