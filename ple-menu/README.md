# PLe Sidebar — Guia de Integração

## Compatibilidade
- **Angular 9.1.0**
- **PrimeNG 9.0.0**
- **PrimeIcons 6.0.1**
- **@nuvem/primeng-components** (framework SERPRO existente)

## Arquivos

```
src/app/
├── components/
│   └── ple-sidebar/
│       ├── ple-sidebar.module.ts          ← NgModule
│       ├── ple-sidebar.component.ts       ← Componente principal
│       ├── ple-sidebar.component.html     ← Template com ARIA completo
│       └── ple-sidebar.component.scss     ← Estilos (white + green + HC)
└── shared/
    └── menu-data.ts                       ← Dados do menu (MenuItem[])
```

## Passo 1 — Copiar Arquivos

Copie os arquivos para a estrutura acima no seu projeto.

## Passo 2 — Importar o Módulo

No `app.module.ts`, adicione:

```typescript
import { PleSidebarModule } from './components/ple-sidebar/ple-sidebar.module';

@NgModule({
  imports: [
    // ... imports existentes
    PleSidebarModule,
  ],
})
export class AppModule {}
```

## Passo 3 — Alterar app.component.html

Substitua o `<div class="layout-menu">` existente pelo novo componente:

```html
<!-- ANTES (atual): -->
<div (click)="onMenuClick($event)" *ngIf="isAuthenticated()" 
     [ngClass]="{ 'layout-menu-dark': darkMenu }" class="layout-menu">
  <p-scrollPanel #scrollPanel [style]="{ height: '100%' }">
    <app-menu></app-menu>
  </p-scrollPanel>
</div>

<!-- DEPOIS (novo): -->
<ple-sidebar 
  *ngIf="isAuthenticated()"
  [menuItems]="pleMenuItems"
  [userName]="userName"
  [userLogin]="userLogin"
  [greenTheme]="true"
  [highContrast]="isHighContrast"
  (menuItemClick)="onPleMenuItemClick($event)"
  (logoutClick)="removerUnidade()"
  (searchClick)="carregarBuscaAvancada()"
  (collapsedChange)="onSidebarCollapsed($event)">
</ple-sidebar>
```

## Passo 4 — Alterar app.component.ts

Adicione as propriedades e adapte o `iniciarMenu()`:

```typescript
import { buildMenuItems, PleMenuItem } from './shared/menu-data';

export class AppComponent {
  // Novas propriedades
  pleMenuItems: PleMenuItem[] = [];
  userName = '';
  userLogin = '';
  isHighContrast = false;
  isSidebarCollapsed = false;

  // Adaptar iniciarMenu() para usar o novo formato:
  iniciarMenu() {
    this.pleMenuItems = buildMenuItems(
      this.authorizationService,
      {
        abrirBlocoAcompanhamento: () => this.abrirDialogBlocoAcompanhamento(),
        abrirBlocoAssinatura: () => this.abrirDialogBlocoAssinatura(),
        exibirCadastroVideNorma: () => this.exibirCadastroVide(this.normaService),
        exibirCadastroVideAto: () => this.exibirCadastroVide(this.atoAdministrativoService),
        siglaUnidade: this.notificacaoService.getSiglaUnidade(),
        tipoUnidadeLogada: this.tipoUnidadeLogada
      },
      UrlEnum,
      PermissaoUtil
    );
  }

  // Handlers
  onPleMenuItemClick(item: PleMenuItem): void {
    // Opcional: analytics, etc.
  }

  onSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }

  carregarBuscaAvancada(): void {
    this.router.navigateByUrl(`/${UrlEnum.PROPOSICAO}/${UrlEnum.ACAO_BUSCAR_AVANCADA}`);
  }
}
```

## Passo 5 — Skip Links (app.component.html)

Adicione no TOPO do template, antes de qualquer outro elemento:

```html
<a href="#main-content" class="ple-skip-link">Ir para conteúdo principal</a>
<a href="#sidebar-nav" class="ple-skip-link ple-skip-link--second">Ir para menu de navegação</a>
```

E no `<div class="layout-content">`, adicione o id:

```html
<div id="main-content" class="layout-content">
```

## Passo 6 — Estilos Globais

Adicione no `styles.scss`:

```scss
// ═══ PLe Sidebar — Layout Overrides ═══
body.sidebar-is-collapsed {
  .layout-main { margin-left: 84px; }
  .topbar { left: 84px; }
}

body:not(.sidebar-is-collapsed):not(.is-mobile) {
  .layout-main { margin-left: 320px; }
  .topbar { left: 320px; }
}

body.is-mobile {
  .layout-main { margin-left: 0; }
  .topbar { left: 0; }
}

body.mobile-menu-open {
  overflow: hidden;
}

// Skip links
.ple-skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: #1f805e;
  color: #fff;
  padding: 10px 20px;
  border-radius: 0 0 8px 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: top 0.15s ease;

  &:focus { top: 0; }
}

// Alto contraste overrides globais
body.high-contrast {
  background: #000 !important;
  .topbar { background: #0a0a0a !important; border-color: #444 !important; }
  .layout-main { background: #000 !important; }
  .ple-skip-link { background: #ffe066; color: #000; }
}
```

## Passo 7 — Remover Layout Antigo

Após confirmar que o novo sidebar funciona:

1. Remova `<app-menu>` e o `<p-scrollPanel>` wrapper do `app.component.html`
2. Remova a chamada `this.menuService.itens = [...]` do `iniciarMenu()` (ou mantenha se breadcrumb depende)
3. Remova a lógica de `onMenuButtonClick` do `app.component.ts` (agora o sidebar controla internamente)

## Features Implementadas

- ✅ **Modo expandido** (320px) — PanelMenu-style com accordion
- ✅ **Modo colapsado** (84px) — Só ícones + tooltips + flyouts
- ✅ **Modo mobile** (≤480px) — Drawer top com hamburger
- ✅ **Tema verde** (#24563F) — Via CSS class `[greenTheme]="true"`
- ✅ **Alto contraste** (#000/#ffe066) — Via `[highContrast]="true"`
- ✅ **Submenu ativo nunca fecha** — Regra preservada
- ✅ **Keyboard nav** — ↑↓←→ Home End Enter Escape
- ✅ **ARIA completo** — role=tree/treeitem, aria-expanded, aria-current, aria-controls
- ✅ **Skip links** — 2 links (conteúdo + menu)
- ✅ **Live region** — Anuncia página atual via aria-live=polite
- ✅ **Focus visible** — Dual-ring pattern
- ✅ **44px touch targets** — min-height em todos os interativos
- ✅ **routerLink integration** — Sync com Angular Router
- ✅ **Reduced motion** — @media (prefers-reduced-motion)

## O que NÃO está incluído (precisa de implementação adicional)

- ❌ **Título responsivo** com overlap detection — Precisa ser feito no header component
- ❌ **Barra de acessibilidade** (A+ A- HC) — Componente separado
- ❌ **Brasão SVG real** — O SVG placeholder precisa ser substituído pelo brasão oficial da CLDF
- ❌ **User avatar com foto** — Precisa integrar com o serviço de foto do usuário
