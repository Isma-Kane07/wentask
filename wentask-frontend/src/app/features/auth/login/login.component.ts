import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-bold text-primary-600">
          WenTask
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Connectez-vous à votre compte
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div class="mt-1">
                <input id="username" 
                       type="text" 
                       formControlName="username"
                       autocomplete="username"
                       class="input-field"
                       [class.border-red-500]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
                       placeholder="@momuser">
                <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le nom d'utilisateur est requis
                </div>
              </div>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div class="mt-1">
                <input id="password" 
                       type="password" 
                       formControlName="password"
                       autocomplete="current-password"
                       class="input-field"
                       [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                       placeholder="••••••••">
                <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le mot de passe est requis
                </div>
              </div>
            </div>

            <!-- Forgot password link -->
            <div class="flex items-center justify-end">
              <div class="text-sm">
                <a routerLink="/auth/forgot-password" 
                   class="font-medium text-primary-600 hover:text-primary-500">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <!-- Error message -->
            <div *ngIf="errorMessage" class="text-sm text-red-600 text-center">
              {{ errorMessage }}
            </div>

            <!-- Submit -->
            <div>
              <button type="submit" 
                      [disabled]="loginForm.invalid || isLoading"
                      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isLoading">Se connecter</span>
                <span *ngIf="isLoading">Connexion...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect';
      }
    });
  }
}