import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { Comment } from '../../../core/models/comment.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Loading -->
      <div *ngIf="isLoading" class="flex justify-center py-12">
        <div class="text-gray-500">Chargement...</div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading && task">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button [routerLink]="['/projects', task.project.id]" 
                    class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <a [routerLink]="['/projects', task.project.id]" 
                   class="text-sm text-primary-600 hover:text-primary-700">
                  {{ task.project.name }}
                </a>
                <span class="text-gray-400">/</span>
                <span class="text-sm text-gray-600">Tâche #{{ task.id }}</span>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">{{ task.title }}</h1>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button (click)="editMode = !editMode" 
                    *ngIf="canEditTask && !editMode"
                    class="btn-secondary">
              Modifier
            </button>
            <button (click)="deleteTask()" 
                    *ngIf="canDeleteTask"
                    class="btn-danger">
              Supprimer
            </button>
          </div>
        </div>

        <!-- Task Details -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            <div class="card">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div *ngIf="!editMode">
                <p class="text-gray-700 whitespace-pre-wrap">
                  {{ task.description || 'Aucune description' }}
                </p>
              </div>
              <form *ngIf="editMode" [formGroup]="editForm" (ngSubmit)="saveChanges()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input type="text" formControlName="title" class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea formControlName="description" rows="5" class="input-field"></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button type="button" (click)="editMode = false" class="btn-secondary">Annuler</button>
                  <button type="submit" [disabled]="editForm.invalid" class="btn-primary">Enregistrer</button>
                </div>
              </form>
            </div>

            <!-- Comments -->
            <div class="card">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Commentaires</h2>
              
              <!-- Add Comment -->
              <form [formGroup]="commentForm" (ngSubmit)="addComment()" class="mb-6">
                <textarea formControlName="content" 
                          rows="2" 
                          placeholder="Ajouter un commentaire..."
                          class="input-field mb-2"></textarea>
                <div class="flex justify-end">
                  <button type="submit" 
                          [disabled]="commentForm.invalid || isAddingComment"
                          class="btn-primary text-sm">
                    {{ isAddingComment ? 'Envoi...' : 'Commenter' }}
                  </button>
                </div>
              </form>

              <!-- Comments List -->
              <div class="space-y-4">
                <div *ngFor="let comment of comments" class="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
                  <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-primary-600 text-sm font-medium">
                        {{ getInitials(comment.author) }}
                      </span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-1">
                        <p class="font-medium text-gray-900">
                          {{ comment.author.firstName }} {{ comment.author.lastName }}
                        </p>
                        <span class="text-xs text-gray-500">
                          {{ comment.createdAt | date:'dd/MM/yyyy HH:mm' }}
                        </span>
                      </div>
                      <p class="text-gray-700">{{ comment.content }}</p>
                    </div>
                  </div>
                </div>

                <div *ngIf="comments.length === 0" class="text-center py-6 text-gray-500">
                  Aucun commentaire
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <!-- Status -->
            <div class="card">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Statut</h3>
              <select *ngIf="task" [(ngModel)]="task.status" 
                      (change)="updateStatus()"
                      [disabled]="!canEditTask"
                      class="input-field">
                <option value="TODO">À faire</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="IN_REVIEW">En revue</option>
                <option value="DONE">Terminée</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="card">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Priorité</h3>
              <select *ngIf="task" [(ngModel)]="task.priority" 
                      (change)="updatePriority()"
                      [disabled]="!canEditTask"
                      class="input-field">
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <!-- Assignee -->
            <div class="card">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Assigné à</h3>
              
              <!-- Mode édition -->
              <div *ngIf="editAssigneeMode; else displayAssignee">
                <select [(ngModel)]="selectedAssigneeId" class="input-field mb-2">
                  <option [ngValue]="null">Non assigné</option>
                  <option *ngFor="let member of projectMembers" [ngValue]="member.id">
                    {{ member.firstName }} {{ member.lastName }} ({{ member.username }})
                  </option>
                </select>
                <div class="flex space-x-2">
                  <button (click)="updateAssignee()" class="btn-primary text-sm py-1 px-3">Enregistrer</button>
                  <button (click)="editAssigneeMode = false" class="btn-secondary text-sm py-1 px-3">Annuler</button>
                </div>
              </div>
              
              <!-- Mode affichage -->
              <ng-template #displayAssignee>
                <div *ngIf="task.assignee" class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span class="text-gray-600 text-sm">{{ getInitials(task.assignee) }}</span>
                    </div>
                    <span>{{ task.assignee.firstName }} {{ task.assignee.lastName }}</span>
                  </div>
                  <button *ngIf="canEditTask" 
                          (click)="startEditAssignee()" 
                          class="text-primary-600 hover:text-primary-700 text-sm">
                    Changer
                  </button>
                </div>
                <div *ngIf="!task.assignee" class="flex items-center justify-between">
                  <p class="text-gray-500">Non assigné</p>
                  <button *ngIf="canEditTask" 
                          (click)="startEditAssignee()" 
                          class="text-primary-600 hover:text-primary-700 text-sm">
                    Assigner
                  </button>
                </div>
              </ng-template>
            </div>

            <!-- Due Date -->
            <div class="card">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Échéance</h3>
              <div *ngIf="editDueDateMode; else displayDueDate">
                <input type="date" 
                       [(ngModel)]="selectedDueDate"
                       class="input-field mb-2">
                <div class="flex space-x-2">
                  <button (click)="updateDueDate()" class="btn-primary text-sm py-1 px-3">Enregistrer</button>
                  <button (click)="editDueDateMode = false" class="btn-secondary text-sm py-1 px-3">Annuler</button>
                </div>
              </div>
              <ng-template #displayDueDate>
                <div class="flex items-center justify-between">
                  <p>{{ task.dueDate ? (task.dueDate | date:'dd/MM/yyyy') : 'Non définie' }}</p>
                  <button *ngIf="canEditTask" 
                          (click)="startEditDueDate()" 
                          class="text-primary-600 hover:text-primary-700 text-sm">
                    {{ task.dueDate ? 'Modifier' : 'Définir' }}
                  </button>
                </div>
              </ng-template>
            </div>

            <!-- Created By -->
            <div class="card">
              <h3 class="text-sm font-medium text-gray-700 mb-3">Créée par</h3>
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 text-sm">{{ getInitials(task.createdBy) }}</span>
                </div>
                <span>{{ task.createdBy.firstName }} {{ task.createdBy.lastName }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                {{ task.createdAt | date:'dd/MM/yyyy HH:mm' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  taskId!: number;
  task: Task | null = null;
  comments: Comment[] = [];
  isLoading = true;
  editMode = false;
  isAddingComment = false;

  // Modes d'édition
  editAssigneeMode = false;
  editDueDateMode = false;
  
  // Sélections temporaires
  selectedAssigneeId: number | null = null;
  selectedDueDate: string = '';
  
  // Membres du projet
  projectMembers: any[] = [];

  editForm: FormGroup;
  commentForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private projectService: ProjectService,
    private commentService: CommentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });

    this.commentForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTask();
    this.loadComments();
  }

  loadTask(): void {
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.editForm.patchValue({
          title: task.title,
          description: task.description
        });
        this.isLoading = false;
      },
      error: (error) => console.error('Error loading task:', error)
    });
  }

  loadComments(): void {
    this.commentService.getCommentsByTask(this.taskId).subscribe({
      next: (comments) => this.comments = comments,
      error: (error) => console.error('Error loading comments:', error)
    });
  }

  loadProjectMembers(): void {
    if (!this.task?.project.id) return;
    
    this.projectService.getProjectById(this.task.project.id).subscribe({
      next: (project: Project) => {
        this.projectMembers = [project.owner, ...project.members];
      },
      error: (error) => console.error('Error loading project members:', error)
    });
  }

  get canEditTask(): boolean {
    const user = this.authService.getUser();
    return this.task?.createdBy.id === user?.id || 
           this.authService.isAdmin() || 
           this.authService.isProjectManager();
  }

  get canDeleteTask(): boolean {
    return this.canEditTask;
  }

  saveChanges(): void {
    if (this.editForm.invalid || !this.task) return;

    this.taskService.patchTask(this.taskId, this.editForm.value).subscribe({
      next: (task) => {
        this.task = task;
        this.editMode = false;
      },
      error: (error) => console.error('Error updating task:', error)
    });
  }

  updateStatus(): void {
    if (!this.task) return;
    this.taskService.patchTask(this.taskId, { status: this.task.status }).subscribe({
      next: (task) => this.task = task,
      error: (error) => console.error('Error updating status:', error)
    });
  }

  updatePriority(): void {
    if (!this.task) return;
    this.taskService.patchTask(this.taskId, { priority: this.task.priority }).subscribe({
      next: (task) => this.task = task,
      error: (error) => console.error('Error updating priority:', error)
    });
  }

  // Gestion de l'assigné
  startEditAssignee(): void {
    this.selectedAssigneeId = this.task?.assignee?.id || null;
    this.loadProjectMembers();
    this.editAssigneeMode = true;
  }

  updateAssignee(): void {
    if (!this.task) return;
    
    this.taskService.patchTask(this.taskId, { assigneeId: this.selectedAssigneeId }).subscribe({
      next: (task) => {
        this.task = task;
        this.editAssigneeMode = false;
      },
      error: (error) => console.error('Error updating assignee:', error)
    });
  }

  // Gestion de la date d'échéance
  startEditDueDate(): void {
    this.selectedDueDate = this.task?.dueDate 
      ? new Date(this.task.dueDate).toISOString().split('T')[0] 
      : '';
    this.editDueDateMode = true;
  }

  updateDueDate(): void {
    if (!this.task) return;
    
    this.taskService.patchTask(this.taskId, { dueDate: this.selectedDueDate || null }).subscribe({
      next: (task) => {
        this.task = task;
        this.editDueDateMode = false;
      },
      error: (error) => console.error('Error updating due date:', error)
    });
  }

  addComment(): void {
    if (this.commentForm.invalid) return;

    this.isAddingComment = true;
    this.commentService.addComment(this.taskId, this.commentForm.value).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.commentForm.reset();
        this.isAddingComment = false;
      },
      error: (error) => {
        console.error('Error adding comment:', error);
        this.isAddingComment = false;
      }
    });
  }

  deleteTask(): void {
    if (!confirm('Supprimer cette tâche ?')) return;

    this.taskService.deleteTask(this.taskId).subscribe({
      next: () => window.history.back(),
      error: (error) => console.error('Error deleting task:', error)
    });
  }

  getInitials(user: any): string {
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username?.substring(0, 2).toUpperCase() || 'U';
  }
}