import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { Task } from '../../../core/models/task.model';
import { UserResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center space-x-4 mb-2">
          <button (click)="goBack()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche' }}
          </h1>
        </div>
        <p class="text-gray-600 ml-10" *ngIf="!isEditMode && projectId">
          Projet : {{ projectName }}
        </p>
      </div>

      <!-- Form -->
      <div class="card">
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Titre <span class="text-red-500">*</span>
            </label>
            <input id="title" 
                   type="text" 
                   formControlName="title"
                   class="input-field"
                   placeholder="Ex: Implémenter l'authentification">
            <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" 
                 class="mt-1 text-sm text-red-600">
              Le titre est requis (3-200 caractères)
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea id="description" 
                      formControlName="description"
                      rows="4"
                      class="input-field"
                      placeholder="Décrivez la tâche en détail..."></textarea>
          </div>

          <!-- Priority & Status -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select id="priority" formControlName="priority" class="input-field">
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div *ngIf="isEditMode">
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select id="status" formControlName="status" class="input-field">
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="IN_REVIEW">En revue</option>
                <option value="DONE">Terminée</option>
              </select>
            </div>
          </div>

          <!-- Assignee & Due Date -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="assignee" class="block text-sm font-medium text-gray-700 mb-1">
                Assigner à
              </label>
              <select id="assignee" formControlName="assigneeId" class="input-field">
                <option [ngValue]="null">Non assigné</option>
                <option *ngFor="let user of projectMembers" [ngValue]="user.id">
                  {{ user.firstName }} {{ user.lastName }} ({{ user.username }})
                </option>
              </select>
            </div>

            <div>
              <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance
              </label>
              <input id="dueDate" 
                     type="date" 
                     formControlName="dueDate"
                     class="input-field">
            </div>
          </div>

          <!-- Error message -->
          <div *ngIf="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" (click)="goBack()" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" 
                    [disabled]="taskForm.invalid || isLoading"
                    class="btn-primary disabled:opacity-50">
              <span *ngIf="!isLoading">{{ isEditMode ? 'Mettre à jour' : 'Créer la tâche' }}</span>
              <span *ngIf="isLoading">Chargement...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId?: number;
  projectId?: number;
  projectName = '';
  isLoading = false;
  errorMessage = '';
  projectMembers: UserResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: [''],
      priority: ['MEDIUM'],
      status: ['TODO'],
      assigneeId: [null],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.projectId = Number(this.route.snapshot.paramMap.get('projectId'));

    if (this.taskId) {
      this.isEditMode = true;
      this.loadTask();
    }

    if (this.projectId) {
      this.loadProjectMembers();
    }
  }

  loadTask(): void {
    this.isLoading = true;
    this.taskService.getTaskById(this.taskId!).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          assigneeId: task.assignee?.id || null,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
        });
        this.projectId = task.project.id;
        this.projectName = task.project.name;
        this.loadProjectMembers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.errorMessage = 'Impossible de charger la tâche';
        this.isLoading = false;
      }
    });
  }

  loadProjectMembers(): void {
    // Dans une vraie application, vous chargeriez les membres du projet
    this.userService.getAllUsers().subscribe({
      next: (users) => this.projectMembers = users,
      error: (error) => console.error('Error loading users:', error)
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      Object.keys(this.taskForm.controls).forEach(key => {
        this.taskForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const taskData = { ...this.taskForm.value };
    if (!taskData.dueDate) delete taskData.dueDate;
    if (!taskData.assigneeId) delete taskData.assigneeId;

    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, taskData).subscribe({
        next: () => this.router.navigate(['/tasks', this.taskId]),
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour';
          this.isLoading = false;
        }
      });
    } else if (this.projectId) {
      this.taskService.createTask(this.projectId, taskData).subscribe({
        next: (task) => this.router.navigate(['/tasks', task.id]),
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.isLoading = false;
        }
      });
    }
  }

  goBack(): void {
    if (this.isEditMode && this.taskId) {
      this.router.navigate(['/tasks', this.taskId]);
    } else if (this.projectId) {
      this.router.navigate(['/projects', this.projectId]);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}