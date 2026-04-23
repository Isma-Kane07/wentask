import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

interface TaskGroup {
  projectId: number;
  projectName: string;
  tasks: Task[];
}

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Mes tâches</h1>
        <p class="text-gray-600">Toutes les tâches qui vous sont assignées</p>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="text-gray-500">Chargement...</div>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!isLoading">
        <!-- Filters -->
        <div class="flex items-center space-x-4">
          <select [(ngModel)]="statusFilter" (ngModelChange)="onFilterChange()" class="input-field w-48">
            <option value="ALL">Toutes ({{ tasks.length }})</option>
            <option value="TODO">À faire</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="IN_REVIEW">En revue</option>
            <option value="DONE">Terminées</option>
          </select>
        </div>

        <!-- Tasks grouped by project -->
        <div class="space-y-6">
          <div *ngFor="let group of taskGroups; trackBy: trackByProject" class="space-y-3">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center">
              <a [routerLink]="['/projects', group.projectId]" 
                 class="hover:text-primary-600 transition-colors">
                {{ group.projectName }}
              </a>
              <span class="ml-3 text-sm font-normal text-gray-500">
                {{ group.tasks.length }} tâche(s)
              </span>
            </h2>

            <div class="space-y-2">
              <div *ngFor="let task of group.tasks; trackBy: trackByTask" 
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
                      <span *ngIf="task.dueDate">
                        📅 Échéance : {{ task.dueDate | date:'dd/MM/yyyy' }}
                      </span>
                      <span *ngIf="isOverdue(task)" class="text-red-500">
                        ⚠️ En retard
                      </span>
                    </div>
                  </div>
                  <div class="ml-4" (click)="$event.stopPropagation()">
                    <select [ngModel]="task.status" 
                            (ngModelChange)="updateTaskStatus(task, $event)"
                            class="text-sm border-gray-300 rounded-lg">
                      <option value="TODO">À faire</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="IN_REVIEW">En revue</option>
                      <option value="DONE">Terminée</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="taskGroups.length === 0" class="card text-center py-12">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
              </path>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune tâche assignée</h3>
            <p class="text-gray-600">Vous n'avez pas de tâches en cours</p>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class MyTasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasksList: Task[] = [];
  taskGroups: TaskGroup[] = [];
  statusFilter: string = 'ALL';
  isLoading = true;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.tasks = [];
        this.filteredTasksList = [];
        this.taskGroups = [];
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    // Filtrer les tâches
    if (this.statusFilter === 'ALL') {
      this.filteredTasksList = [...this.tasks];
    } else {
      this.filteredTasksList = this.tasks.filter(t => t.status === this.statusFilter);
    }
    
    // Grouper les tâches
    this.groupTasks();
  }

  private groupTasks(): void {
    const groups = new Map<number, TaskGroup>();
    
    this.filteredTasksList.forEach(task => {
      const projectId = task.project?.id;
      const projectName = task.project?.name;
      
      if (!projectId || !projectName) {
        return;
      }
      
      if (!groups.has(projectId)) {
        groups.set(projectId, {
          projectId,
          projectName,
          tasks: []
        });
      }
      groups.get(projectId)!.tasks.push(task);
    });
    
    this.taskGroups = Array.from(groups.values());
  }

  trackByProject(index: number, group: TaskGroup): number {
    return group.projectId;
  }

  trackByTask(index: number, task: Task): number {
    return task.id;
  }

  updateTaskStatus(task: Task, newStatus: string): void {
    const previousStatus = task.status;
    task.status = newStatus as any;
    
    // Mettre à jour l'affichage après changement de statut
    this.applyFilter();
    
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      error: (error) => {
        console.error('Error updating task status:', error);
        task.status = previousStatus;
        this.applyFilter(); // Restaurer l'affichage
      }
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
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