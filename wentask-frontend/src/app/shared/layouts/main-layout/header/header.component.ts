import { Component, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <!-- Logo et titre -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span [innerHTML]="logoIcon"></span>
          </div>
          <h1 class="text-xl font-semibold text-gray-800">WenTask</h1>
        </div>
        
        <div class="flex items-center space-x-3">
          <!-- Notifications -->
          <button class="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
            <span [innerHTML]="bellIcon"></span>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <!-- Menu utilisateur -->
          <div class="relative" #userMenu>
            <button (click)="toggleDropdown($event)" 
                    class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {{ getUserInitials() }}
              </div>
              <span class="text-sm font-medium text-gray-700 hidden sm:block">{{ getUserName() }}</span>
              <span [innerHTML]="chevronDownIcon" 
                    class="transition-transform" 
                    [class.rotate-180]="showDropdown"></span>
            </button>
            
            <!-- Dropdown menu -->
            <div *ngIf="showDropdown" 
                 class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <!-- Info utilisateur -->
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ getUserName() }}</p>
                <p class="text-xs text-gray-500 truncate">{{ getUserEmail() }}</p>
                <span class="inline-block mt-1 badge text-xs" [ngClass]="getRoleBadgeClass()">
                  {{ getRoleLabel() }}
                </span>
              </div>
              
              <!-- Liens -->
              <a routerLink="/profile" 
                 (click)="closeDropdown()"
                 class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <span [innerHTML]="userIcon"></span>
                <span>Mon profil</span>
              </a>
              
              <a routerLink="/settings" 
                 (click)="closeDropdown()"
                 class="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <span [innerHTML]="settingsIcon"></span>
                <span>Paramètres</span>
              </a>
              
              <hr class="my-1 border-gray-200">
              
              <button (click)="logout()" 
                      class="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <span [innerHTML]="logoutIcon"></span>
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .rotate-180 { transform: rotate(180deg); }
  `]
})
export class HeaderComponent {
  showDropdown = false;

  logoIcon!: SafeHtml;
  bellIcon!: SafeHtml;
  chevronDownIcon!: SafeHtml;
  userIcon!: SafeHtml;
  settingsIcon!: SafeHtml;
  logoutIcon!: SafeHtml;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef
  ) {
    this.initIcons();
  }

  private initIcons(): void {
    this.logoIcon = this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`);

    this.bellIcon = this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>`);

    this.chevronDownIcon = this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>`);

    this.userIcon = this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>`);

    this.settingsIcon = this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>`);

    this.logoutIcon = this.sanitize(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>`);
  }

  private sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ✅ Correction : Fermer le dropdown seulement si on clique EN DEHORS du menu
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const userMenu = this.elementRef.nativeElement.querySelector('.relative');
    
    // Si le clic est en dehors du menu utilisateur, fermer le dropdown
    if (userMenu && !userMenu.contains(target)) {
      this.showDropdown = false;
    }
  }

  getUserName(): string {
    const user = this.authService.getUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || 'Utilisateur';
  }

  getUserEmail(): string {
    const user = this.authService.getUser();
    return user?.email || '';
  }

  getUserInitials(): string {
    const user = this.authService.getUser();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user?.username?.substring(0, 2).toUpperCase() || 'U';
  }

  getRoleLabel(): string {
    const user = this.authService.getUser();
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'PROJECT_MANAGER': 'Chef de projet',
      'MEMBER': 'Membre'
    };
    return labels[user?.role || ''] || 'Utilisateur';
  }

  getRoleBadgeClass(): string {
    const user = this.authService.getUser();
    const classes: Record<string, string> = {
      'ADMIN': 'badge-danger',
      'PROJECT_MANAGER': 'badge-warning',
      'MEMBER': 'badge-info'
    };
    return classes[user?.role || ''] || 'badge-secondary';
  }

  // ✅ Nouvelle méthode : toggle avec stopPropagation
  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation(); // Empêche la propagation pour ne pas fermer immédiatement
    this.showDropdown = !this.showDropdown;
  }

  // ✅ Nouvelle méthode : fermer le dropdown
  closeDropdown(): void {
    this.showDropdown = false;
  }

  logout(): void {
    this.showDropdown = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}