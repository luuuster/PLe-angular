/**
 * PLe Sidebar Module
 * Angular 9 NgModule — importar no AppModule ou SharedModule
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG 9
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

// Component
import { PleSidebarComponent } from './ple-sidebar.component';

@NgModule({
  declarations: [PleSidebarComponent],
  imports: [
    CommonModule,
    RouterModule,
    TooltipModule,
    ButtonModule
  ],
  exports: [PleSidebarComponent]
})
export class PleSidebarModule {}
