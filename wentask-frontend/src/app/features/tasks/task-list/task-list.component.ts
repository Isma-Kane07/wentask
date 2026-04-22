import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-2">
      <div *ngFor="let task of tasks" 
           class="card hover:shadow-lg transition-shadow cursor-pointer"
           [routerLink]="['/tasks', task.id]">
        
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Title & Priority -->
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="font-medium text-gray-900">{{ task.title }}</h3>
              <span class="badge text-xs" [ngClass]="getPriorityClass(task.priority)">
                {{ getPriorityLabel(task.priority) }}
              </span>
              <span class="badge text-xs" [ngClass]="getStatusClass(task.status)">
                {{ getStatusLabel(task.status) }}
              </span>
            </div>
            
            <!-- Description -->
            <p class="text-sm text-gray-600 mb-2 line-clamp-2">
              {{ task.description || 'Aucune description' }}
            </p>
            
            <!-- Meta info -->
            <div class="flex items-center space-x-4 text-xs text-gray-500">
              <span *ngIf="task.assignee" class="flex items-center space-x-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span>{{ task.assignee.firstName || task.assignee.username }}</span>
              </span>
              
              <span *ngIf="!task.assignee" class="flex items-center space-x-1 text-orange-500">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>Non assignée</span>
              </span>
              
              <span *ngIf="task.dueDate" 
                    class="flex items-center space-x-1"
                    [class.text-red-500]="isOverdue(task)">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>{{ task.dueDate | date:'dd/MM/yyyy' }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="tasks.length === 0" class="card text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
          </path>
        </svg>
        <p>Aucune tâche</p>
      </div>
    </div>
  `
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];

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

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  }
}