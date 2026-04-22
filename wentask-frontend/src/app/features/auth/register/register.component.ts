import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-bold text-gray-900">
          Créer un compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Rejoignez WenTask pour gérer vos projets
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div class="mt-1">
                <input id="username" 
                       type="text" 
                       formControlName="username"
                       class="input-field">
                <div *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  <span *ngIf="registerForm.get('username')?.errors?.['required']">Requis</span>
                  <span *ngIf="registerForm.get('username')?.errors?.['minlength']">Minimum 3 caractères</span>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div class="mt-1">
                <input id="email" 
                       type="email" 
                       formControlName="email"
                       class="input-field">
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Email valide requis
                </div>
              </div>
            </div>

            <!-- First Name & Last Name -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input id="firstName" 
                       type="text" 
                       formControlName="firstName"
                       class="input-field">
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input id="lastName" 
                       type="text" 
                       formControlName="lastName"
                       class="input-field">
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
                       class="input-field">
                <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Minimum 6 caractères
                </div>
                            </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div class="mt-1">
                <input id="confirmPassword" 
                       type="password" 
                       formControlName="confirmPassword"
                       class="input-field">
                <div *ngIf="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>

            <!-- Success/Error messages -->
            <div *ngIf="successMessage" class="text-sm text-green-600 text-center">
              {{ successMessage }}
            </div>
            <div *ngIf="errorMessage" class="text-sm text-red-600 text-center">
              {{ errorMessage }}
            </div>

            <!-- Submit -->
            <div>
              <button type="submit" 
                      [disabled]="registerForm.invalid || isLoading"
                      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isLoading">S'inscrire</span>
                <span *ngIf="isLoading">Inscription...</span>
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Déjà un compte ?
              <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      return { mismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { confirmPassword, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}