import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  // Auth routes (public) - avec AuthLayout
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Protected routes (with MainLayout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      
      // Projects
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/project-list/project-list.component')
          .then(m => m.ProjectListComponent)
      },
      {
        path: 'projects/new',
        loadComponent: () => import('./features/projects/project-form/project-form.component')
          .then(m => m.ProjectFormComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component')
          .then(m => m.ProjectDetailComponent)
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () => import('./features/projects/project-form/project-form.component')
          .then(m => m.ProjectFormComponent)
      },
      {
        path: 'projects/:id/board',
        loadComponent: () => import('./features/tasks/task-board/task-board.component')
          .then(m => m.TaskBoardComponent)
      },
      
      // Tasks
      {
        path: 'my-tasks',
        loadComponent: () => import('./features/tasks/my-tasks/my-tasks.component')
          .then(m => m.MyTasksComponent)
      },
      {
        path: 'tasks/new',
        loadComponent: () => import('./features/tasks/task-form/task-form.component')
          .then(m => m.TaskFormComponent)
      },
      {
        path: 'tasks/:id',
        loadComponent: () => import('./features/tasks/task-detail/task-detail.component')
          .then(m => m.TaskDetailComponent)
      },
      {
        path: 'tasks/:id/edit',
        loadComponent: () => import('./features/tasks/task-form/task-form.component')
          .then(m => m.TaskFormComponent)
      },

      // ✅ ROUTES ADMIN - À AJOUTER
      {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
          { path: '', redirectTo: 'users', pathMatch: 'full' },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/user-list/user-list.component')
              .then(m => m.UserListComponent)
          }
        ]
      }
    ]
  },
  
  { path: '**', redirectTo: 'dashboard' }
];