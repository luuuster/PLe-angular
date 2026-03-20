/**
 * PLe Sidebar Component
 *
 * Menu lateral completo com:
 * - Modo expandido (320px) com PanelMenu accordion
 * - Modo colapsado (84px) com tooltips e flyouts
 * - Modo mobile (drawer top) com user panel
 * - Tema verde (#24563F) via CSS
 * - Alto contraste (#000/#ffe066)
 * - WCAG 2.1 AA completo
 *
 * Compatível com Angular 9 + PrimeNG 9
 * Integra com @nuvem/primeng-components MenusService
 */
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  Renderer2
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { PleMenuItem } from '../shared/menu-data';

/** Breakpoints — sincronizados com CSS */
const BP_TABLET = 1024;
const BP_MOBILE = 480;

/** Larguras do sidebar */
const SIDEBAR_WIDTH = 320;
const SIDEBAR_COLLAPSED_WIDTH = 84;

@Component({
  selector: 'ple-sidebar',
  templateUrl: './ple-sidebar.component.html',
  styleUrls: ['./ple-sidebar.component.scss'],
  animations: [
    trigger('submenuAnimation', [
      state('hidden', style({ height: '0', overflow: 'hidden', opacity: 0 })),
      state('visible', style({ height: '*', overflow: 'hidden', opacity: 1 })),
      transition('hidden <=> visible', animate('250ms cubic-bezier(0.4, 0, 0.2, 1)'))
    ]),
    trigger('flyoutAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-8px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'translateX(-8px)' }))
      ])
    ]),
    trigger('drawerAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', visibility: 'hidden' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)', visibility: 'visible' }))
      ]),
      transition(':leave', [
        animate('250ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(-100%)', visibility: 'hidden' }))
      ])
    ])
  ]
})
export class PleSidebarComponent implements OnInit, OnDestroy {
  // ═══ INPUTS ═══
  @Input() menuItems: PleMenuItem[] = [];
  @Input() userName = '';
  @Input() userLogin = '';
  @Input() greenTheme = true;
  @Input() highContrast = false;

  // ═══ OUTPUTS ═══
  @Output() menuItemClick = new EventEmitter<PleMenuItem>();
  @Output() logoutClick = new EventEmitter<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Output() searchClick = new EventEmitter<void>();

  // ═══ STATE ═══
  isCollapsed = false;
  isMobile = false;
  mobileMenuOpen = false;
  activeMenuId: string | null = null;
  openMenuIds: { [key: string]: boolean } = {};
  openFlyoutId: string | null = null;
  focusedMenuId: string | null = null;

  /** Flyout position (fixed, calculado via getBoundingClientRect) */
  flyoutStyle: { [key: string]: string } = {};
  flyoutOpenUp = false;

  /** Live region text for screen readers */
  liveRegionText = '';

  // ═══ PRIVATE ═══
  private subscriptions: Subscription[] = [];
  private mediaQueryTablet: MediaQueryList;
  private mediaQueryMobile: MediaQueryList;

  @ViewChild('sidebarNav', { static: false }) sidebarNavRef: ElementRef;
  @ViewChild('flyoutContainer', { static: false }) flyoutContainerRef: ElementRef;

  constructor(
    private router: Router,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  // ═══ LIFECYCLE ═══
  ngOnInit(): void {
    this.setupMediaQueries();
    this.syncActiveFromRoute(this.router.url);

    // Listen to route changes
    const routeSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.syncActiveFromRoute(e.urlAfterRedirects);
      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.removeBodyClasses();
  }

  // ═══ MEDIA QUERIES ═══
  private setupMediaQueries(): void {
    // Tablet: auto-collapse
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryTablet = window.matchMedia(`(max-width: ${BP_TABLET}px)`);
      this.mediaQueryMobile = window.matchMedia(`(max-width: ${BP_MOBILE}px)`);

      // Initial check
      this.onTabletChange(this.mediaQueryTablet.matches);
      this.onMobileChange(this.mediaQueryMobile.matches);

      // Angular 9 compatible: addListener (não addEventListener)
      this.mediaQueryTablet.addListener((e) => this.onTabletChange(e.matches));
      this.mediaQueryMobile.addListener((e) => this.onMobileChange(e.matches));
    }
  }

  private onTabletChange(matches: boolean): void {
    if (matches && !this.isMobile) {
      this.isCollapsed = true;
    }
    this.updateBodyClasses();
    this.collapsedChange.emit(this.isCollapsed);
  }

  private onMobileChange(matches: boolean): void {
    this.isMobile = matches;
    if (matches) {
      this.isCollapsed = false; // Mobile mostra labels
      this.openFlyoutId = null;
    }
    this.updateBodyClasses();
  }

  // ═══ BODY CLASSES ═══
  private updateBodyClasses(): void {
    const body = document.body;
    this.toggleClass(body, 'sidebar-is-collapsed', this.isCollapsed && !this.isMobile);
    this.toggleClass(body, 'is-mobile', this.isMobile);
    this.toggleClass(body, 'mobile-menu-open', this.mobileMenuOpen);
    this.toggleClass(body, 'high-contrast', this.highContrast);
  }

  private removeBodyClasses(): void {
    const body = document.body;
    body.classList.remove('sidebar-is-collapsed', 'is-mobile', 'mobile-menu-open', 'high-contrast');
  }

  private toggleClass(el: HTMLElement, cls: string, add: boolean): void {
    if (add) {
      el.classList.add(cls);
    } else {
      el.classList.remove(cls);
    }
  }

  // ═══ COLLAPSE / EXPAND ═══
  toggleCollapse(): void {
    if (this.isMobile) {
      this.toggleMobileMenu();
      return;
    }
    this.isCollapsed = !this.isCollapsed;
    this.openFlyoutId = null;
    this.updateBodyClasses();
    this.collapsedChange.emit(this.isCollapsed);
  }

  /** Chamado pelo header collapse button */
  getCollapseAriaLabel(): string {
    if (this.isMobile) {
      return this.mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação';
    }
    return this.isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral';
  }

  getCollapseIcon(): string {
    if (this.isMobile) {
      return this.mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars';
    }
    return this.isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left';
  }

  // ═══ MOBILE DRAWER ═══
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.updateBodyClasses();
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.updateBodyClasses();
  }

  // ═══ MENU ITEM CLICK ═══
  onMenuItemClick(item: PleMenuItem, event: Event): void {
    if (!item.items || item.items.length === 0) {
      // Item sem filhos: navega ou executa command
      this.activeMenuId = item.menuId;
      this.liveRegionText = `Página atual: ${item.label}`;

      if (item.command) {
        item.command({ originalEvent: event, item });
      }

      this.menuItemClick.emit(item);

      if (this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    } else {
      // Item COM filhos: toggle submenu
      this.toggleSubmenu(item);
    }
  }

  // ═══ SUBMENU TOGGLE ═══
  toggleSubmenu(item: PleMenuItem): void {
    if (this.isCollapsed && !this.isMobile) {
      // Modo colapsado: flyout
      this.toggleFlyout(item, null);
      return;
    }

    const id = item.menuId;
    const isOpen = this.openMenuIds[id];

    // REGRA: Submenu com item ativo NUNCA fecha
    if (isOpen && this.hasActiveChild(item)) {
      return;
    }

    // Accordion: fecha outros (exceto os que têm item ativo)
    const newState: { [key: string]: boolean } = {};
    for (const key of Object.keys(this.openMenuIds)) {
      const menuItem = this.findMenuItemById(key);
      if (menuItem && this.hasActiveChild(menuItem)) {
        newState[key] = true; // Mantém aberto
      }
    }

    if (!isOpen) {
      newState[id] = true;
    }

    this.openMenuIds = newState;
  }

  isSubmenuOpen(item: PleMenuItem): boolean {
    return !!this.openMenuIds[item.menuId];
  }

  getSubmenuAnimationState(item: PleMenuItem): string {
    return this.isSubmenuOpen(item) ? 'visible' : 'hidden';
  }

  // ═══ FLYOUT (colapsado) ═══
  toggleFlyout(item: PleMenuItem, triggerElement: HTMLElement): void {
    if (this.openFlyoutId === item.menuId) {
      this.openFlyoutId = null;
      return;
    }

    this.openFlyoutId = item.menuId;

    // Calcula posição via getBoundingClientRect
    if (triggerElement) {
      setTimeout(() => this.calculateFlyoutPosition(triggerElement), 0);
    }
  }

  private calculateFlyoutPosition(trigger: HTMLElement): void {
    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const flyoutHeight = 250; // estimativa

    // Detecta se precisa abrir para cima
    this.flyoutOpenUp = (rect.bottom + flyoutHeight) > viewportHeight;

    if (this.flyoutOpenUp) {
      this.flyoutStyle = {
        position: 'fixed',
        left: `${SIDEBAR_COLLAPSED_WIDTH + 4}px`,
        bottom: `${viewportHeight - rect.bottom}px`,
        top: 'auto'
      };
    } else {
      this.flyoutStyle = {
        position: 'fixed',
        left: `${SIDEBAR_COLLAPSED_WIDTH + 4}px`,
        top: `${rect.top}px`,
        bottom: 'auto'
      };
    }
    this.cdr.detectChanges();
  }

  onFlyoutItemClick(parent: PleMenuItem, child: PleMenuItem, event: Event): void {
    this.activeMenuId = child.menuId;
    this.openFlyoutId = null;
    this.liveRegionText = `Página atual: ${child.label}`;

    // Expande sidebar ao clicar sub-item no flyout
    this.isCollapsed = false;
    this.openMenuIds[parent.menuId] = true;
    this.updateBodyClasses();
    this.collapsedChange.emit(this.isCollapsed);

    if (child.command) {
      child.command({ originalEvent: event, item: child });
    }
    this.menuItemClick.emit(child);
  }

  // ═══ OUTSIDE CLICK ═══
  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Fecha flyout se click fora
    if (this.openFlyoutId) {
      const target = event.target as HTMLElement;
      if (!this.el.nativeElement.contains(target)) {
        this.openFlyoutId = null;
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.openFlyoutId) {
      this.openFlyoutId = null;
    }
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  // ═══ KEYBOARD NAVIGATION ═══
  onKeyDown(event: KeyboardEvent, item: PleMenuItem, index: number): void {
    const visibleItems = this.getVisibleItems();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(visibleItems, index, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusNextItem(visibleItems, index, -1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (item.items && item.items.length > 0 && !this.isSubmenuOpen(item)) {
          this.toggleSubmenu(item);
          // Focus first child after 50ms
          setTimeout(() => {
            const firstChild = this.el.nativeElement.querySelector(
              `#menuitem-${item.items[0].menuId}`
            );
            if (firstChild) { firstChild.focus(); }
          }, 50);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        // Se é sub-item, volta ao pai
        const parent = this.findParentItem(item);
        if (parent) {
          const parentEl = this.el.nativeElement.querySelector(`#menuitem-${parent.menuId}`);
          if (parentEl) { parentEl.focus(); }
        }
        break;
      case 'Home':
        event.preventDefault();
        this.focusItem(visibleItems[0]);
        break;
      case 'End':
        event.preventDefault();
        this.focusItem(visibleItems[visibleItems.length - 1]);
        break;
    }
  }

  private focusNextItem(items: PleMenuItem[], currentIndex: number, direction: number): void {
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) { nextIndex = items.length - 1; }
    if (nextIndex >= items.length) { nextIndex = 0; }
    this.focusItem(items[nextIndex]);
  }

  private focusItem(item: PleMenuItem): void {
    if (!item) { return; }
    const el = this.el.nativeElement.querySelector(`#menuitem-${item.menuId}`);
    if (el) { el.focus(); }
  }

  // ═══ ACTIVE STATE ═══
  isActive(item: PleMenuItem): boolean {
    return this.activeMenuId === item.menuId;
  }

  hasActiveChild(item: PleMenuItem): boolean {
    if (!item.items) { return false; }
    return item.items.some(child =>
      child.menuId === this.activeMenuId || this.hasActiveChild(child)
    );
  }

  isParentActive(item: PleMenuItem): boolean {
    return item.items && item.items.length > 0 && this.hasActiveChild(item);
  }

  // ═══ SYNC FROM ROUTE ═══
  private syncActiveFromRoute(url: string): void {
    const found = this.findMenuItemByRoute(url, this.menuItems);
    if (found) {
      this.activeMenuId = found.menuId;
      this.liveRegionText = `Página atual: ${found.label}`;

      // Abre submenu do pai
      const parent = this.findParentItem(found);
      if (parent) {
        this.openMenuIds[parent.menuId] = true;
      }
    }
  }

  private findMenuItemByRoute(url: string, items: PleMenuItem[]): PleMenuItem | null {
    for (const item of items) {
      if (item.routerLink) {
        const route = Array.isArray(item.routerLink)
          ? item.routerLink.join('/')
          : item.routerLink;
        if (url.startsWith(route)) {
          return item;
        }
      }
      if (item.items) {
        const found = this.findMenuItemByRoute(url, item.items);
        if (found) { return found; }
      }
    }
    return null;
  }

  private findMenuItemById(id: string): PleMenuItem | null {
    return this.findItemRecursive(id, this.menuItems);
  }

  private findItemRecursive(id: string, items: PleMenuItem[]): PleMenuItem | null {
    for (const item of items) {
      if (item.menuId === id) { return item; }
      if (item.items) {
        const found = this.findItemRecursive(id, item.items);
        if (found) { return found; }
      }
    }
    return null;
  }

  private findParentItem(target: PleMenuItem): PleMenuItem | null {
    for (const item of this.menuItems) {
      if (item.items) {
        const found = item.items.find(c => c.menuId === target.menuId);
        if (found) { return item; }
      }
    }
    return null;
  }

  private getVisibleItems(): PleMenuItem[] {
    return this.menuItems.filter(item => item.visible !== false);
  }

  // ═══ ACCESSIBILITY ═══
  toggleHighContrast(): void {
    this.highContrast = !this.highContrast;
    this.updateBodyClasses();
  }

  // ═══ HELPERS ═══
  getNavItemClasses(item: PleMenuItem): { [key: string]: boolean } {
    return {
      'ple-nav-item': true,
      'ple-nav-item--active': this.isParentActive(item),
      'ple-nav-item--expanded': this.isSubmenuOpen(item),
      'ple-nav-item--selected': this.isActive(item) && (!item.items || item.items.length === 0),
      'ple-nav-item--has-active': this.isCollapsed && this.hasActiveChild(item),
      'ple-nav-item--has-children': !!item.items && item.items.length > 0,
      'ple-nav-item--flyout-open': this.openFlyoutId === item.menuId
    };
  }

  getSubItemClasses(child: PleMenuItem): { [key: string]: boolean } {
    return {
      'ple-sub-item': true,
      'ple-sub-item--active': this.isActive(child)
    };
  }

  trackByMenuId(index: number, item: PleMenuItem): string {
    return item.menuId;
  }

  onLogout(): void {
    this.logoutClick.emit();
  }

  onSearchClick(): void {
    this.searchClick.emit();
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}
