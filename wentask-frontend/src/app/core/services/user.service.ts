import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse, UpdateUserRequest, MessageResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  searchUsers(username: string): Observable<UserResponse[]> {
    const params = new HttpParams().set('username', username);
    return this.http.get<UserResponse[]>(`${this.apiUrl}/search`, { params });
  }

  // ✅ Nouveau : Mettre à jour un utilisateur
  updateUser(id: number, userData: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, userData);
  }

  // ✅ Nouveau : Supprimer un utilisateur
  deleteUser(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.apiUrl}/${id}`);
  }
}