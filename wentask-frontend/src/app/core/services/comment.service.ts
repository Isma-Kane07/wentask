import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment, CommentRequest } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getCommentsByTask(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/task/${taskId}`);
  }

  addComment(taskId: number, comment: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/task/${taskId}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}