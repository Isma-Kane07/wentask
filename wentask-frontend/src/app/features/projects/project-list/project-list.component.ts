import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mes projets</h1>
          <p class="text-gray-600">Gérez vos projets et collaborez avec votre équipe</p>
        </div>
        <!-- ✅ Bouton conditionné au rôle -->
        <button *ngIf="canCreateProject()" 
                (click)="showCreateModal = true" 
                class="btn-primary flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Nouveau projet</span>
        </button>
      </div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let project of projects" 
             class="card hover:shadow-lg transition-shadow cursor-pointer"
             [routerLink]="['/projects', project.id]">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">{{ project.name }}</h3>
            <span class="badge" [ngClass]="getStatusClass(project.status)">
              {{ getStatusLabel(project.status) }}
            </span>
          </div>
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">
            {{ project.description || 'Aucune description' }}
          </p>
          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center space-x-2">
              <span>👑 {{ project.owner.firstName || project.owner.username }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                </path>
              </svg>
              <span>{{ (project.members ? project.members.length : 0) + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State - Avec message adapté au rôle -->
        <div *ngIf="projects.length === 0" class="col-span-full">
          <div class="card text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
              </path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
            
            <!-- ✅ Message différent selon le rôle -->
            <ng-container *ngIf="canCreateProject(); else memberMessage">
              <p class="text-gray-600 mb-4">Commencez par créer votre premier projet</p>
              <button (click)="showCreateModal = true" class="btn-primary">
                Créer un projet
              </button>
            </ng-container>
            <ng-template #memberMessage>
              <p class="text-gray-600">Vous n'avez pas encore été invité à un projet.</p>
              <p class="text-gray-500 text-sm mt-2">Contactez un Project Manager ou un Admin pour être ajouté.</p>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Create Project Modal -->
      <div *ngIf="showCreateModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           (click)="closeModal()">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
          <div class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Nouveau projet</h2>
            
            <form [formGroup]="projectForm" (ngSubmit)="createProject()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Nom du projet *
                </label>
                <input type="text" 
                       formControlName="name"
                       class="input-field"
                       placeholder="Mon super projet"
                       [class.border-red-500]="projectForm.get('name')?.invalid && projectForm.get('name')?.touched">
                <div *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le nom du projet est requis
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea formControlName="description"
                          rows="3"
                          class="input-field"
                          placeholder="Description du projet..."></textarea>
              </div>

              <!-- Message d'erreur -->
              <div *ngIf="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ errorMessage }}</p>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button type="button" 
                        (click)="closeModal()"
                        class="btn-secondary">
                  Annuler
                </button>
                <button type="submit" 
                        [disabled]="projectForm.invalid || isCreating"
                        class="btn-primary disabled:opacity-50">
                  {{ isCreating ? 'Création...' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  showCreateModal = false;
  isCreating = false;
  errorMessage = '';
  projectForm: FormGroup;

  constructor(
    private projectService: ProjectService,
    private fb: FormBuilder,
    public authService: AuthService  // ✅ Rendre public pour le template
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => this.projects = projects,
      error: (error) => console.error('Error loading projects:', error)
    });
  }

  // ✅ Vérifier si l'utilisateur peut créer des projets
  canCreateProject(): boolean {
    return this.authService.canCreateProject();
  }

  createProject(): void {
    if (this.projectForm.invalid) return;

    this.isCreating = true;
    this.errorMessage = '';

    this.projectService.createProject(this.projectForm.value).subscribe({
      next: (project) => {
        this.projects.unshift(project);
        this.closeModal();
        this.projectForm.reset();
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la création du projet';
        this.isCreating = false;
      }
    });
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.projectForm.reset();
    this.errorMessage = '';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'badge-success',
      'COMPLETED': 'badge-info',
      'ARCHIVED': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'COMPLETED': 'Terminé',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  }
}