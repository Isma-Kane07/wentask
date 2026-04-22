import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 relative overflow-hidden">
      <!-- Animated background shapes -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Top right blob -->
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply opacity-20 animate-blob"></div>
        
        <!-- Bottom left blob -->
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply opacity-20 animate-blob animation-delay-2000"></div>
        
        <!-- Middle blob -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <!-- Grid pattern overlay -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <!-- Content -->
      <div class="relative flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-md">
          <!-- Logo -->
          <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-primary-600">WenTask</h1>
            <p class="text-gray-600 mt-2">Gérez vos projets simplement</p>
          </div>
          
          <!-- Router outlet for auth pages -->
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% {
        transform: translate(0px, 0px) scale(1);
      }
      33% {
        transform: translate(30px, -50px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
      100% {
        transform: translate(0px, 0px) scale(1);
      }
    }
    
    .animate-blob {
      animation: blob 7s infinite;
    }
    
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    
    .bg-grid-pattern {
      background-image: 
        linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    
    :host {
      display: block;
    }
  `]
})
export class AuthLayoutComponent {}