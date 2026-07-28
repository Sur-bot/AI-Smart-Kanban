import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // State management using RxJS BehaviorSubject as requested
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if user info is already stored in memory/storage (if applicable) or load from an initial /me endpoint
  }

  /**
   * Get current user value synchronously
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login user with email and password.
   * Uses HttpOnly Cookies so no token is stored in JS.
   */
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials, { withCredentials: true }).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  /**
   * Register a new user
   */
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, userData);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/verify-email?token=${token}`);
  }

  /**
   * Logout user and clear cookies/state
   */
  logout(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }),
      catchError(() => {
        // Even if the server fails, clear local state
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        return of(null);
      })
    );
  }

  /**
   * Call the refresh endpoint to get a new access token using the refresh_token HttpOnly cookie.
   */
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true });
  }
}
