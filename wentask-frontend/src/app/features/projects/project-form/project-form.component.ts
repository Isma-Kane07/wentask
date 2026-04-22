import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center space-x-4 mb-2">
          <button routerLink="/projects" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode ? 'Modifier le projet' : 'Nouveau projet' }}
          </h1>
        </div>
        <p class="text-gray-600 ml-10">
          {{ isEditMode ? 'Modifiez les informations du projet' : 'Créez un nouveau projet pour collaborer avec votre équipe' }}
        </p>
      </div>

      <!-- Form -->
      <div class="card">
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Nom du projet <span class="text-red-500">*</span>
            </label>
            <input id="name" 
                   type="text" 
                   formControlName="name"
                   class="input-field"
                   placeholder="Ex: Refonte du site web"
                   [class.border-red-500]="projectForm.get('name')?.invalid && projectForm.get('name')?.touched">
            <div *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched" 
                 class="mt-1 text-sm text-red-600">
              <span *ngIf="projectForm.get('name')?.errors?.['required']">Le nom du projet est requis</span>
              <span *ngIf="projectForm.get('name')?.errors?.['minlength']">Minimum 3 caractères</span>
              <span *ngIf="projectForm.get('name')?.errors?.['maxlength']">Maximum 100 caractères</span>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea id="description" 
                      formControlName="description"
                      rows="5"
                      class="input-field"
                      placeholder="Décrivez votre projet, ses objectifs..."></textarea>
            <p class="mt-1 text-xs text-gray-500">
              {{ projectForm.get('description')?.value?.length || 0 }}/1000 caractères
            </p>
          </div>

          <!-- Status (only in edit mode) -->
          <div *ngIf="isEditMode">
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select id="status" formControlName="status" class="input-field">
              <option value="ACTIVE">Actif</option>
              <option value="COMPLETED">Terminé</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>

          <!-- Error message -->
          <div *ngIf="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" 
                    routerLink="/projects"
                    class="btn-secondary">
              Annuler
            </button>
            <button type="submit" 
                    [disabled]="projectForm.invalid || isLoading"
                    class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isLoading">{{ isEditMode ? 'Mettre à jour' : 'Créer le projet' }}</span>
              <span *ngIf="isLoading">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = false;
  projectId?: number;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      status: ['ACTIVE']
    });
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.projectId) {
      this.isEditMode = true;
      this.loadProject();
    }
  }

  loadProject(): void {
    this.isLoading = true;
    this.projectService.getProjectById(this.projectId!).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description || '',
          status: project.status
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.errorMessage = 'Impossible de charger le projet';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const projectData = this.projectForm.value;

    if (this.isEditMode && this.projectId) {
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: () => {
          this.router.navigate(['/projects', this.projectId]);
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du projet';
          this.isLoading = false;
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: (project) => {
          this.router.navigate(['/projects', project.id]);
        },
        error: (error) => {
          console.error('Error creating project:', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création du projet';
          this.isLoading = false;
        }
      });
    }
  }
}