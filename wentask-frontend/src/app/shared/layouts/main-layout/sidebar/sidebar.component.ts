import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: SafeHtml;  // ✅ Changer le type en SafeHtml
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-white shadow-sm border-r border-gray-200 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
      <nav class="p-4 space-y-1">
        <!-- Menu principal -->
        <ng-container *ngFor="let item of menuItems">
          <a *ngIf="canShowMenuItem(item)"
             [routerLink]="[item.route]"
             routerLinkActive="bg-primary-50 text-primary-700 border-l-4 border-primary-600"
             class="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <span class="w-5 h-5" [innerHTML]="item.icon"></span>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        </ng-container>
        
        <!-- Séparateur Admin -->
        <div *ngIf="isAdmin()" class="pt-4 mt-4 border-t border-gray-200">
          <p class="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Administration
          </p>
        </div>
        
        <!-- Menu Admin -->
        <ng-container *ngFor="let item of adminMenuItems">
          <a *ngIf="canShowMenuItem(item)"
             [routerLink]="[item.route]"
             routerLinkActive="bg-primary-50 text-primary-700 border-l-4 border-primary-600"
             class="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <span class="w-5 h-5" [innerHTML]="item.icon"></span>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        </ng-container>
      </nav>
    </aside>
  `
})
export class SidebarComponent {
  menuItems: MenuItem[] = [];
  adminMenuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer  // ✅ Injecter DomSanitizer
  ) {
    this.initMenuItems();
  }

  private initMenuItems(): void {
    this.menuItems = [
      {
        label: 'Tableau de bord',
        icon: this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>`),
        route: '/dashboard'
      },
      {
        label: 'Mes projets',
        icon: this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>`),
        route: '/projects'
      },
      {
        label: 'Mes tâches',
        icon: this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>`),
        route: '/my-tasks'
      }
    ];

    this.adminMenuItems = [
      {
        label: 'Utilisateurs',
        icon: this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>`),
        route: '/admin/users',
        roles: ['ADMIN']
      }
    ];
  }

  private sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  canShowMenuItem(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    return item.roles.some(role => this.authService.hasRole(role));
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}