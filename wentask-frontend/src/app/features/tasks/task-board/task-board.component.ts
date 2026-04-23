import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';

interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, RouterModule, DragDropModule],
  template: `
    <div class="space-y-6">
      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="text-gray-500">Chargement...</div>
      </div>

      <!-- Content -->
      <ng-container *ngIf="!isLoading && project">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button [routerLink]="['/projects', projectId]" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Tableau Kanban - {{ project.name }}</h1>
              <p class="text-gray-600">Gérez vos tâches par glisser-déposer</p>
            </div>
          </div>
          <button *ngIf="canCreateTask" 
                  [routerLink]="['/projects', projectId]" 
                  class="btn-primary flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Nouvelle tâche</span>
          </button>
        </div>

        <!-- Info sur les permissions -->
        <div *ngIf="!canMoveAnyTask" class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          <span class="font-medium">Note :</span> Vous pouvez uniquement déplacer les tâches qui vous sont assignées (en couleur normale).
        </div>

        <!-- Board -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div *ngFor="let column of columns" 
               class="bg-gray-50 rounded-lg p-4"
               [style.backgroundColor]="column.color + '10'">
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full" [style.backgroundColor]="column.color"></div>
                <h3 class="font-semibold text-gray-900">{{ column.title }}</h3>
              </div>
              <span class="text-sm text-gray-500">{{ column.tasks.length }}</span>
            </div>

            <!-- Tasks -->
            <div cdkDropList
                 [id]="column.id"
                 [cdkDropListData]="column.tasks"
                 [cdkDropListConnectedTo]="connectedLists"
                 (cdkDropListDropped)="drop($event)"
                 class="space-y-2 min-h-[200px]">
              
              <div *ngFor="let task of column.tasks" 
                   cdkDrag
                   [cdkDragDisabled]="!canMoveTask(task)"
                   [cdkDragData]="task"
                   class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 transition-shadow"
                   [class.cursor-move]="canMoveTask(task)"
                   [class.cursor-not-allowed]="!canMoveTask(task)"
                   [class.opacity-60]="!canMoveTask(task)"
                   [class.hover:shadow-md]="canMoveTask(task)">
                
                <!-- Drag Handle -->
                <div class="flex items-center justify-center -mt-1 mb-2">
                  <div class="w-8 h-1 bg-gray-300 rounded-full"></div>
                </div>

                <!-- Task Content -->
                <div [routerLink]="['/tasks', task.id]" class="cursor-pointer">
                  <h4 class="font-medium text-gray-900 mb-1 line-clamp-2">{{ task.title }}</h4>
                  <p class="text-xs text-gray-500 mb-2 line-clamp-2" *ngIf="task.description">
                    {{ task.description }}
                  </p>
                  
                  <!-- Priority Badge -->
                  <div class="flex items-center justify-between mb-2">
                    <span class="badge text-xs" [ngClass]="getPriorityClass(task.priority)">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>

                  <!-- Assignee & Due Date -->
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <div class="flex items-center space-x-1">
                      <span *ngIf="task.assignee">
                        👤 {{ task.assignee.firstName || task.assignee.username }}
                      </span>
                      <span *ngIf="!task.assignee" class="text-orange-500">
                        ⚠️ Non assigné
                      </span>
                    </div>
                    <span *ngIf="task.dueDate" 
                          [class.text-red-500]="isOverdue(task)">
                      📅 {{ task.dueDate | date:'dd/MM' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="column.tasks.length === 0" 
                   class="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                Glissez une tâche ici
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .cdk-drag-preview {
      @apply shadow-xl rounded-lg opacity-90 bg-white;
    }
    
    .cdk-drag-placeholder {
      @apply opacity-30;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TaskBoardComponent implements OnInit {
  projectId!: number;
  project: Project | null = null;
  tasks: Task[] = [];
  columns: TaskColumn[] = [];
  connectedLists: string[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
  isLoading = true;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.currentUserId = this.authService.getUser()?.id || null;
    this.loadProject();
    this.loadTasks();
  }

  loadProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
      },
      error: (error) => console.error('Error loading project:', error)
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.tasks = tasks || [];
        this.organizeTasksByStatus();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.tasks = [];
        this.organizeTasksByStatus();
        this.isLoading = false;
      }
    });
  }

  organizeTasksByStatus(): void {
    this.columns = [
      {
        id: 'TODO',
        title: 'À faire',
        tasks: this.tasks.filter(t => t.status === 'TODO'),
        color: '#6B7280'
      },
      {
        id: 'IN_PROGRESS',
        title: 'En cours',
        tasks: this.tasks.filter(t => t.status === 'IN_PROGRESS'),
        color: '#3B82F6'
      },
      {
        id: 'IN_REVIEW',
        title: 'En revue',
        tasks: this.tasks.filter(t => t.status === 'IN_REVIEW'),
        color: '#F59E0B'
      },
      {
        id: 'DONE',
        title: 'Terminées',
        tasks: this.tasks.filter(t => t.status === 'DONE'),
        color: '#10B981'
      }
    ];
  }

  get canCreateTask(): boolean {
    const user = this.authService.getUser();
    return this.project?.owner.id === user?.id || this.authService.isAdmin();
  }

  get canMoveAnyTask(): boolean {
    const user = this.authService.getUser();
    return this.project?.owner.id === user?.id || this.authService.isAdmin();
  }

  canMoveTask(task: Task): boolean {
    // Admin et propriétaire peuvent tout déplacer
    if (this.canMoveAnyTask) {
      return true;
    }
    
    // Les membres peuvent déplacer leurs propres tâches (assignées ou créées)
    return task.assignee?.id === this.currentUserId || task.createdBy?.id === this.currentUserId;
  }

  drop(event: CdkDragDrop<Task[]>): void {
    // Récupérer la tâche déplacée
    const task = event.previousContainer.data[event.previousIndex];
    
    if (!task) {
      console.error('Task not found');
      return;
    }

    // ✅ Vérifier si l'utilisateur peut déplacer CETTE tâche
    if (!this.canMoveTask(task)) {
      alert('Vous ne pouvez déplacer que vos propres tâches.');
      return;
    }

    // Si même colonne, juste réorganiser
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data, 
        event.previousIndex, 
        event.currentIndex
      );
      return;
    }

    const newStatus = event.container.id;
    const oldStatus = task.status;

    // Mettre à jour localement
    task.status = newStatus as any;

    // Déplacer la tâche
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    // Mettre à jour via API
    this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
      next: () => {
        console.log(`Task ${task.id} status updated to ${newStatus}`);
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        
        // Rollback
        task.status = oldStatus;
        
        const currentColumn = this.columns.find(c => c.id === newStatus);
        const previousColumn = this.columns.find(c => c.id === oldStatus);
        
        if (currentColumn && previousColumn) {
          const taskIndex = currentColumn.tasks.findIndex(t => t.id === task.id);
          if (taskIndex > -1) {
            currentColumn.tasks.splice(taskIndex, 1);
            previousColumn.tasks.push(task);
          }
        }
        
        alert('Erreur lors de la mise à jour du statut.');
      }
    });
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

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  }
}