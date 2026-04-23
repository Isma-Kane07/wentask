import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-bold text-gray-900">
          WenTask
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Réinitialiser votre mot de passe
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <!-- Étape 1 : Vérification username + email -->
          <form *ngIf="!identityVerified" [formGroup]="verifyForm" (ngSubmit)="onVerify()" class="space-y-6">
            <p class="text-sm text-gray-600 mb-4">
              Entrez votre nom d'utilisateur et votre adresse email pour vérifier votre identité.
            </p>

            <!-- Username -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div class="mt-1">
                <input id="username" 
                       type="text" 
                       formControlName="username"
                       class="input-field"
                       placeholder="@momuser"
                       [class.border-red-500]="verifyForm.get('username')?.invalid && verifyForm.get('username')?.touched">
                <div *ngIf="verifyForm.get('username')?.invalid && verifyForm.get('username')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Le nom d'utilisateur est requis
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
                       class="input-field"
                       placeholder="john@example.com"
                       [class.border-red-500]="verifyForm.get('email')?.invalid && verifyForm.get('email')?.touched">
                <div *ngIf="verifyForm.get('email')?.invalid && verifyForm.get('email')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Un email valide est requis
                </div>
              </div>
            </div>

            <!-- Message -->
            <div *ngIf="message" class="text-sm" 
                 [class.text-green-600]="!errorMessage" 
                 [class.text-red-600]="errorMessage">
              {{ message }}
            </div>

            <!-- Submit -->
            <div>
              <button type="submit" 
                      [disabled]="verifyForm.invalid || isLoading"
                      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isLoading">Vérifier mon identité</span>
                <span *ngIf="isLoading">Vérification...</span>
              </button>
            </div>

            <!-- Retour -->
            <div class="text-center">
              <a routerLink="/auth/login" class="text-sm text-primary-600 hover:text-primary-500">
                Retour à la connexion
              </a>
            </div>
          </form>

          <!-- Étape 2 : Nouveau mot de passe -->
          <form *ngIf="identityVerified" [formGroup]="resetForm" (ngSubmit)="onReset()" class="space-y-6">
            <p class="text-sm text-gray-600 mb-4">
              Identité vérifiée pour <strong>{{ verifyForm.get('username')?.value }}</strong>.
              Entrez votre nouveau mot de passe.
            </p>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div class="mt-1">
                <input id="newPassword" 
                       [type]="showPassword ? 'text' : 'password'"
                       formControlName="newPassword"
                       class="input-field"
                       placeholder="••••••••"
                       [class.border-red-500]="resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched">
                <div *ngIf="resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched" 
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
                       [type]="showPassword ? 'text' : 'password'"
                       formControlName="confirmPassword"
                       class="input-field"
                       placeholder="••••••••"
                       [class.border-red-500]="resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched">
                <div *ngIf="resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched" 
                     class="mt-1 text-sm text-red-600">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>

            <!-- Show password toggle -->
            <div class="flex items-center">
              <input id="show-password" 
                     type="checkbox" 
                     [(ngModel)]="showPassword"
                     [ngModelOptions]="{standalone: true}"
                     class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
              <label for="show-password" class="ml-2 block text-sm text-gray-900">
                Afficher le mot de passe
              </label>
            </div>

            <!-- Message -->
            <div *ngIf="message" class="text-sm" 
                 [class.text-green-600]="!errorMessage" 
                 [class.text-red-600]="errorMessage">
              {{ message }}
            </div>

            <!-- Submit -->
            <div>
              <button type="submit" 
                      [disabled]="resetForm.invalid || isLoading"
                      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isLoading">Réinitialiser le mot de passe</span>
                <span *ngIf="isLoading">Réinitialisation...</span>
              </button>
            </div>

            <!-- Retour -->
            <div class="text-center">
              <button type="button" 
                      (click)="identityVerified = false" 
                      class="text-sm text-gray-600 hover:text-gray-900">
                Modifier l'identifiant
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  verifyForm: FormGroup;
  resetForm: FormGroup;
  
  isLoading = false;
  identityVerified = false;
  message = '';
  errorMessage = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.verifyForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirm = form.get('confirmPassword');
    if (password?.value !== confirm?.value) {
      return { mismatch: true };
    }
    return null;
  }

  onVerify(): void {
    if (this.verifyForm.invalid) return;

    this.isLoading = true;
    this.message = '';
    this.errorMessage = false;

    this.authService.verifyIdentity(this.verifyForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.identityVerified = true;
        this.message = response.message || 'Identité vérifiée !';
        this.errorMessage = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error.error?.message || 'Nom d\'utilisateur ou email incorrect';
        this.errorMessage = true;
      }
    });
  }

  onReset(): void {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    this.message = '';
    this.errorMessage = false;

    const data = {
      username: this.verifyForm.value.username,
      email: this.verifyForm.value.email,
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(data).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.message = 'Mot de passe réinitialisé avec succès ! Redirection...';
        this.errorMessage = false;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error.error?.message || 'Erreur lors de la réinitialisation';
        this.errorMessage = true;
      }
    });
  }
}