import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';  
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project, ProjectStats } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
import { UserResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="text-gray-500">Chargement...</div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading && project">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button routerLink="/projects" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ project.name }}</h1>
              <p class="text-gray-600">{{ project.description || 'Aucune description' }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button *ngIf="canEditProject" 
                    (click)="showEditModal = true" 
                    class="btn-secondary flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                </path>
              </svg>
              <span>Modifier</span>
            </button>
            <button (click)="showTaskModal = true" class="btn-primary flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Nouvelle tâche</span>
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="card">
            <p class="text-sm text-gray-600">Total tâches</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats?.totalTasks || 0 }}</p>
          </div>
          <div class="card">
            <p class="text-sm text-gray-600">À faire</p>
            <p class="text-2xl font-bold text-yellow-600">{{ stats?.todoTasks || 0 }}</p>
          </div>
          <div class="card">
            <p class="text-sm text-gray-600">En cours</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats?.inProgressTasks || 0 }}</p>
          </div>
          <div class="card">
            <p class="text-sm text-gray-600">En revue</p>
            <p class="text-2xl font-bold text-purple-600">{{ stats?.inReviewTasks || 0 }}</p>
          </div>
          <div class="card">
            <p class="text-sm text-gray-600">Terminées</p>
            <p class="text-2xl font-bold text-green-600">{{ stats?.doneTasks || 0 }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8">
            <button (click)="activeTab = 'tasks'"
                    [class.border-primary-500]="activeTab === 'tasks'"
                    [class.text-primary-600]="activeTab === 'tasks'"
                    class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Tâches
            </button>
            <button (click)="activeTab = 'members'"
                    [class.border-primary-500]="activeTab === 'members'"
                    [class.text-primary-600]="activeTab === 'members'"
                    class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Membres
            </button>
            <button (click)="activeTab = 'settings'"
                    *ngIf="isOwner"
                    [class.border-primary-500]="activeTab === 'settings'"
                    [class.text-primary-600]="activeTab === 'settings'"
                    class="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Paramètres
            </button>
          </nav>
        </div>

        <!-- Tasks Tab -->
        <div *ngIf="activeTab === 'tasks'" class="space-y-4">
          <!-- Filter -->
          <div class="flex items-center space-x-4">
            <select [(ngModel)]="taskFilter" class="input-field w-48">
              <option value="ALL">Toutes les tâches</option>
              <option value="TODO">À faire</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="IN_REVIEW">En revue</option>
              <option value="DONE">Terminées</option>
            </select>
          </div>

          <!-- Tasks List -->
          <div class="space-y-2">
            <div *ngFor="let task of filteredTasks" 
                 class="card hover:shadow-lg transition-shadow cursor-pointer"
                 [routerLink]="['/tasks', task.id]">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h3 class="font-medium text-gray-900">{{ task.title }}</h3>
                    <span class="badge" [ngClass]="getPriorityClass(task.priority)">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                    <span class="badge" [ngClass]="getStatusClass(task.status)">
                      {{ getStatusLabel(task.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ task.description || 'Aucune description' }}</p>
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span *ngIf="task.assignee">
                      👤 {{ task.assignee.firstName || task.assignee.username }}
                    </span>
                    <span *ngIf="!task.assignee" class="text-orange-500">
                      ⚠️ Non assignée
                    </span>
                    <span *ngIf="task.dueDate">
                      📅 {{ task.dueDate | date:'dd/MM/yyyy' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="tasks.length === 0" class="card text-center py-8 text-gray-500">
              Aucune tâche dans ce projet
            </div>
          </div>
        </div>

        <!-- Members Tab -->
        <div *ngIf="activeTab === 'members'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Membres du projet</h2>
            <button *ngIf="isOwner" 
                    (click)="showAddMemberModal = true" 
                    class="btn-secondary flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              <span>Ajouter un membre</span>
            </button>
          </div>

          <div class="space-y-2">
            <!-- Owner -->
            <div class="card flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span class="text-primary-600 font-medium">
                    {{ getInitials(project.owner) }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ project.owner.firstName }} {{ project.owner.lastName }}
                  </p>
                  <p class="text-sm text-gray-500">{{ project.owner.email }}</p>
                </div>
              </div>
              <span class="badge badge-warning">Propriétaire</span>
            </div>

            <!-- Members -->
            <div *ngFor="let member of project.members" 
                 class="card flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 font-medium">
                    {{ getInitials(member) }}
                  </span>
                </div>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ member.firstName }} {{ member.lastName }}
                  </p>
                  <p class="text-sm text-gray-500">{{ member.email }}</p>
                </div>
              </div>
              <button *ngIf="isOwner"
                      (click)="removeMember(member.id)"
                      class="text-red-500 hover:text-red-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div *ngIf="activeTab === 'settings' && isOwner" class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Paramètres du projet</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Statut du projet</label>
              <select [(ngModel)]="project.status" 
                      (change)="updateProjectStatus()"
                      class="input-field w-48">
                <option value="ACTIVE">Actif</option>
                <option value="COMPLETED">Terminé</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <button (click)="confirmDelete()" 
                      class="btn-danger">
                Supprimer le projet
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Task Modal -->
      <div *ngIf="showTaskModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           (click)="closeTaskModal()">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4" (click)="$event.stopPropagation()">
          <div class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Nouvelle tâche</h2>
            
            <form [formGroup]="taskForm" (ngSubmit)="createTask()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input type="text" formControlName="title" class="input-field">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea formControlName="description" rows="3" class="input-field"></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select formControlName="priority" class="input-field">
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Assigner à</label>
                  <select formControlName="assigneeId" class="input-field">
  <option [ngValue]="null">Non assigné</option>
  <ng-container *ngIf="project">
    <option [ngValue]="project.owner.id">
      {{ project.owner.firstName }} {{ project.owner.lastName }} (Propriétaire)
    </option>
    <option *ngFor="let member of project.members" [ngValue]="member.id">
      {{ member.firstName }} {{ member.lastName }}
    </option>
  </ng-container>
</select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                <input type="date" formControlName="dueDate" class="input-field">
              </div>
              
              <div class="flex justify-end space-x-3 pt-4">
                <button type="button" (click)="closeTaskModal()" class="btn-secondary">Annuler</button>
                <button type="submit" [disabled]="taskForm.invalid || isCreating" class="btn-primary">
                  {{ isCreating ? 'Création...' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Member Modal -->
      <div *ngIf="showAddMemberModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           (click)="closeAddMemberModal()">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4" (click)="$event.stopPropagation()">
          <div class="p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Ajouter un membre</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rechercher un utilisateur</label>
                <input type="text" 
                       [(ngModel)]="searchQuery"
                       (input)="searchUsers()"
                       placeholder="Nom d'utilisateur..."
                       class="input-field">
              </div>
              
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div *ngFor="let user of searchResults" 
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p class="font-medium">{{ user.username }}</p>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                  </div>
                  <button (click)="addMember(user.id)"
                          class="btn-secondary text-sm">
                    Ajouter
                  </button>
                </div>
                
                <div *ngIf="searchResults.length === 0 && searchQuery" 
                     class="text-center py-4 text-gray-500">
                  Aucun utilisateur trouvé
                </div>
              </div>
            </div>
            
            <div class="flex justify-end pt-4">
              <button (click)="closeAddMemberModal()" class="btn-secondary">Fermer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  projectId!: number;
  project: Project | null = null;
  stats: ProjectStats | null = null;
  tasks: Task[] = [];
  isLoading = true;
  activeTab: 'tasks' | 'members' | 'settings' = 'tasks';
  taskFilter: string = 'ALL';
  
  showTaskModal = false;
  showEditModal = false;
  showAddMemberModal = false;
  isCreating = false;
  
  taskForm: FormGroup;
  editProjectForm: FormGroup;
  
  searchQuery = '';
  searchResults: UserResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['MEDIUM'],
      assigneeId: [null],
      dueDate: ['']
    });
    
    this.editProjectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject();
    this.loadStats();
    this.loadTasks();
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.router.navigate(['/projects']);
      }
    });
  }

  loadStats(): void {
    this.projectService.getProjectStats(this.projectId).subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  loadTasks(): void {
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => this.tasks = tasks,
      error: (error) => console.error('Error loading tasks:', error)
    });
  }

  get filteredTasks(): Task[] {
    if (this.taskFilter === 'ALL') return this.tasks;
    return this.tasks.filter(t => t.status === this.taskFilter);
  }

  get canEditProject(): boolean {
    const user = this.authService.getUser();
    return this.project?.owner.id === user?.id || this.authService.isAdmin();
  }

  get isOwner(): boolean {
    const user = this.authService.getUser();
    return this.project?.owner.id === user?.id;
  }

  createTask(): void {
    if (this.taskForm.invalid) return;

    this.isCreating = true;
    const taskData = { ...this.taskForm.value };
    if (!taskData.dueDate) delete taskData.dueDate;
    if (!taskData.assigneeId) delete taskData.assigneeId;

    this.taskService.createTask(this.projectId, taskData).subscribe({
      next: (task) => {
        this.tasks.unshift(task);
        this.closeTaskModal();
        this.loadStats();
      },
      error: (error) => console.error('Error creating task:', error),
      complete: () => this.isCreating = false
    });
  }

  updateProjectStatus(): void {
    if (!this.project) return;
    
    this.projectService.updateProject(this.projectId, {
      name: this.project.name,
      description: this.project.description,
      status: this.project.status
    }).subscribe({
      next: (project) => this.project = project,
      error: (error) => console.error('Error updating project:', error)
    });
  }

  searchUsers(): void {
    if (this.searchQuery.length < 2) {
      this.searchResults = [];
      return;
    }
    
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {
        // Filtrer les utilisateurs qui ne sont pas déjà membres
        const memberIds = [this.project?.owner.id, ...(this.project?.members.map(m => m.id) || [])];
        this.searchResults = users.filter(u => !memberIds.includes(u.id));
      },
      error: (error) => console.error('Error searching users:', error)
    });
  }

  addMember(userId: number): void {
    this.projectService.addMember(this.projectId, userId).subscribe({
      next: (project) => {
        this.project = project;
        this.closeAddMemberModal();
      },
      error: (error) => console.error('Error adding member:', error)
    });
  }

  removeMember(userId: number): void {
    if (!confirm('Retirer ce membre du projet ?')) return;
    
    this.projectService.removeMember(this.projectId, userId).subscribe({
      next: (project) => this.project = project,
      error: (error) => console.error('Error removing member:', error)
    });
  }

  confirmDelete(): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) return;
    
    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => this.router.navigate(['/projects']),
      error: (error) => console.error('Error deleting project:', error)
    });
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.taskForm.reset({ priority: 'MEDIUM', assigneeId: null });
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
    this.searchQuery = '';
    this.searchResults = [];
  }

  getInitials(user: any): string {
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username?.substring(0, 2).toUpperCase() || 'U';
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'LOW': 'badge-info',
      'MEDIUM': 'badge-warning',
      'HIGH': 'badge-danger',
      'URGENT': 'badge-danger'
    };
    return classes[priority] || 'badge-secondary';
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'LOW': 'Basse',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Haute',
      'URGENT': 'Urgente'
    };
    return labels[priority] || priority;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'TODO': 'badge-secondary',
      'IN_PROGRESS': 'badge-info',
      'IN_REVIEW': 'badge-warning',
      'DONE': 'badge-success'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'TODO': 'À faire',
      'IN_PROGRESS': 'En cours',
      'IN_REVIEW': 'En revue',
      'DONE': 'Terminée'
    };
    return labels[status] || status;
  }
}