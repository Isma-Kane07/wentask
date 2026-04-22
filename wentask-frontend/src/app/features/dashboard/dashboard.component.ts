import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/models/project.model';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p class="text-gray-600">Bienvenue, {{ userName }} !</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total projets</p>
              <p class="text-2xl font-bold text-gray-900">{{ projects.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                </path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Tâches totales</p>
              <p class="text-2xl font-bold text-gray-900">{{ myTasks.length }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                </path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Tâches en cours</p>
              <p class="text-2xl font-bold text-gray-900">{{ inProgressTasks }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Tâches terminées</p>
              <p class="text-2xl font-bold text-gray-900">{{ completedTasks }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Projects & Tasks -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Projects -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Projets récents</h2>
            <a routerLink="/projects" class="text-sm text-primary-600 hover:text-primary-700">
              Voir tout →
            </a>
          </div>
          <div class="space-y-3">
            <div *ngFor="let project of recentProjects" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                 [routerLink]="['/projects', project.id]">
              <div>
                <p class="font-medium text-gray-900">{{ project.name }}</p>
                <p class="text-sm text-gray-600">{{ project.description || 'Aucune description' }}</p>
              </div>
              <span class="badge" [ngClass]="getProjectStatusClass(project.status)">
                {{ getProjectStatusLabel(project.status) }}
              </span>
            </div>
            <div *ngIf="projects.length === 0" class="text-center py-6 text-gray-500">
              Aucun projet pour le moment
            </div>
          </div>
        </div>

        <!-- My Tasks -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Mes tâches</h2>
            <a routerLink="/my-tasks" class="text-sm text-primary-600 hover:text-primary-700">
              Voir tout →
            </a>
          </div>
          <div class="space-y-3">
            <div *ngFor="let task of recentTasks" 
                 class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ task.title }}</p>
                  <p class="text-sm text-gray-600">{{ task.project.name }}</p>
                </div>
                <span class="badge ml-2" [ngClass]="getTaskPriorityClass(task.priority)">
                  {{ getTaskPriorityLabel(task.priority) }}
                </span>
              </div>
            </div>
            <div *ngIf="myTasks.length === 0" class="text-center py-6 text-gray-500">
              Aucune tâche assignée
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  myTasks: Task[] = [];
  userName = '';

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadProjects();
    this.loadMyTasks();
  }

  loadUserName(): void {
    const user = this.authService.getUser();
    this.userName = user?.firstName || user?.username || 'Utilisateur';
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (projects) => this.projects = projects,
      error: (error) => console.error('Error loading projects:', error)
    });
  }

  loadMyTasks(): void {
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => this.myTasks = tasks,
      error: (error) => console.error('Error loading tasks:', error)
    });
  }

  get recentProjects(): Project[] {
    return this.projects.slice(0, 5);
  }

  get recentTasks(): Task[] {
    return this.myTasks.slice(0, 5);
  }

  get inProgressTasks(): number {
    return this.myTasks.filter(t => t.status === 'IN_PROGRESS').length;
  }

  get completedTasks(): number {
    return this.myTasks.filter(t => t.status === 'DONE').length;
  }

  getProjectStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ACTIVE': 'badge-success',
      'COMPLETED': 'badge-info',
      'ARCHIVED': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getProjectStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'ACTIVE': 'Actif',
      'COMPLETED': 'Terminé',
      'ARCHIVED': 'Archivé'
    };
    return labels[status] || status;
  }

  getTaskPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'LOW': 'badge-info',
      'MEDIUM': 'badge-warning',
      'HIGH': 'badge-danger',
      'URGENT': 'badge-danger'
    };
    return classes[priority] || 'badge-secondary';
  }

  getTaskPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      'LOW': 'Basse',
      'MEDIUM': 'Moyenne',
      'HIGH': 'Haute',
      'URGENT': 'Urgente'
    };
    return labels[priority] || priority;
  }
}