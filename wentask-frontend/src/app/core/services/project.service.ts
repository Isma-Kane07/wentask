import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectRequest, ProjectStats } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  getProjectStats(id: number): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(`${this.apiUrl}/${id}/stats`);
  }

  createProject(project: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: ProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMember(projectId: number, userId: number): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${projectId}/members/${userId}`, {});
  }

  removeMember(projectId: number, userId: number): Observable<Project> {
    return this.http.delete<Project>(`${this.apiUrl}/${projectId}/members/${userId}`);
  }
}