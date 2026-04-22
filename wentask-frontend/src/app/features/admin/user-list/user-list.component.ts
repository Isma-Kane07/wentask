import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserResponse, UpdateUserRequest, SignupRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p class="text-gray-600">Gérez les comptes et les rôles des utilisateurs</p>
        </div>
        <button (click)="openCreateModal()" 
                class="btn-primary flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Nouvel utilisateur</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <input type="text" 
                 [(ngModel)]="searchQuery"
                 (input)="filterUsers()"
                 placeholder="Rechercher un utilisateur..."
                 class="input-field">
        </div>
        <select [(ngModel)]="roleFilter" (change)="filterUsers()" class="input-field w-48">
          <option value="ALL">Tous les rôles</option>
          <option value="ADMIN">Admin</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="MEMBER">Membre</option>
        </select>
      </div>

      <!-- Users Table -->
      <div class="card overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-primary-600 font-medium">{{ getInitials(user) }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                    <div class="text-sm text-gray-500">&#64;{{ user.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge" [ngClass]="getRoleClass(user.role)">{{ getRoleLabel(user.role) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openEditModal(user)" class="text-primary-600 hover:text-primary-900 mr-3">Modifier</button>
                <button *ngIf="user.id !== currentUserId" (click)="openDeleteModal(user)" class="text-red-600 hover:text-red-900">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="filteredUsers.length === 0" class="text-center py-12 text-gray-500">Aucun utilisateur trouvé</div>
      </div>

      <!-- Create/Edit Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModal()">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
          <div class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">{{ editingUser ? 'Modifier' : 'Nouvel' }} utilisateur</h2>
            <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label><input type="text" formControlName="firstName" class="input-field"></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Nom</label><input type="text" formControlName="lastName" class="input-field"></div>
              </div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label><input type="text" formControlName="username" class="input-field"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" formControlName="email" class="input-field"></div>
              <div *ngIf="!editingUser"><label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label><input type="password" formControlName="password" class="input-field"></div>
              <div *ngIf="editingUser"><label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe (laisser vide pour ne pas changer)</label><input type="password" formControlName="password" class="input-field"></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select formControlName="role" class="input-field">
                  <option value="MEMBER">Membre</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div *ngIf="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</div>
              <div class="flex justify-end space-x-3 pt-4">
                <button type="button" (click)="closeModal()" class="btn-secondary">Annuler</button>
                <button type="submit" [disabled]="userForm.invalid || isLoading" class="btn-primary">{{ isLoading ? 'Enregistrement...' : (editingUser ? 'Mettre à jour' : 'Créer') }}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div *ngIf="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="showDeleteModal = false">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" (click)="$event.stopPropagation()">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Confirmer la suppression</h2>
          <p class="text-gray-600 mb-6">Supprimer <strong>{{ userToDelete?.username }}</strong> ? Cette action est irréversible.</p>
          <div class="flex justify-end space-x-3">
            <button (click)="showDeleteModal = false" class="btn-secondary">Annuler</button>
            <button (click)="confirmDelete()" class="btn-danger">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];
  searchQuery = '';
  roleFilter = 'ALL';
  currentUserId: number | null = null;
  
  showModal = false;
  showDeleteModal = false;
  editingUser: UserResponse | null = null;
  userToDelete: UserResponse | null = null;
  isLoading = false;
  errorMessage = '';
  
  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['MEMBER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUser()?.id || null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => { this.users = users; this.filterUsers(); },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchQuery || 
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesRole = this.roleFilter === 'ALL' || user.role === this.roleFilter;
      return matchesSearch && matchesRole;
    });
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.userForm.reset({ role: 'MEMBER' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.showModal = true;
  }

  openEditModal(user: UserResponse): void {
    this.editingUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValue('');
    this.showModal = true;
  }

  openDeleteModal(user: UserResponse): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const formValue = this.userForm.value;
    
    if (this.editingUser) {
      const updateData: UpdateUserRequest = {
        username: formValue.username,
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: formValue.role
      };
      if (formValue.password) updateData.password = formValue.password;
      
      this.userService.updateUser(this.editingUser.id, updateData).subscribe({
        next: () => { this.loadUsers(); this.closeModal(); },
        error: (error) => { this.errorMessage = error.error?.message || 'Erreur'; this.isLoading = false; }
      });
    } else {
      const signupData: SignupRequest = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        role: [formValue.role]
      };
      this.authService.register(signupData).subscribe({
        next: () => { this.loadUsers(); this.closeModal(); },
        error: (error) => { this.errorMessage = error.error?.message || 'Erreur'; this.isLoading = false; }
      });
    }
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;
    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => { this.loadUsers(); this.showDeleteModal = false; this.userToDelete = null; },
      error: (error) => console.error('Error deleting user:', error)
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUser = null;
    this.errorMessage = '';
    this.isLoading = false;
  }

  getInitials(user: UserResponse): string {
    if (user.firstName && user.lastName) return (user.firstName[0] + user.lastName[0]).toUpperCase();
    return user.username.substring(0, 2).toUpperCase();
  }

  getRoleClass(role: string): string {
    const classes: Record<string, string> = { 'ADMIN': 'badge-danger', 'PROJECT_MANAGER': 'badge-warning', 'MEMBER': 'badge-info' };
    return classes[role] || 'badge-secondary';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = { 'ADMIN': 'Admin', 'PROJECT_MANAGER': 'PM', 'MEMBER': 'Membre' };
    return labels[role] || role;
  }
}