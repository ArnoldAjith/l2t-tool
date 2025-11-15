// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { Api } from '../api';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  showPwd = false;
  isSubmitting = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private api: Api,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  // Getter methods for easy access to form controls
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // Method to check if field has error and was touched
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  // Method to get specific error message
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPwd = !this.showPwd;
  }

  onSubmit(): void {
    this.submitted = true;
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.message = 'Please fill in all required fields correctly';
      this.messageType = 'error';
      return;
    }

    const formData = new FormData();
    const { email, password } = this.loginForm.value;

    formData.append('password', password);
    formData.append('mailId', email);

    this.isSubmitting = true;
    this.message = '';
    this.messageType = '';

    //const apiUrl = "http://localhost:8080/login/authenticate";
     const apiUrl = 'https://datteamwork.com:8060/login/authenticate';
    // const apiUrl = 'https://tagbees.com:8060/login/authenticate';

    this.http.post(apiUrl, formData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        if (response && response.status === 'success') {
          this.message = response.message || 'Login successful!';
          this.messageType = 'success';
          if (response.userName) {
            sessionStorage.setItem('username', response.userName);
            sessionStorage.setItem('mailID', response.mailID);
            sessionStorage.setItem('monitoring', response.monitoringID);
            sessionStorage.setItem('role', response.role);
            sessionStorage.setItem('sessionID', response.sessionID);
          }
          console.log(sessionStorage);
          // this.router.navigateByUrl('/header');
          this.loginForm.reset();
          this.submitted = false;
          this.router.navigate(['/header']);
        } else {
          this.message = response?.message || 'Login failed. Please try again.';
          this.messageType = 'error';
        }
      }
    })
  };


  homePage(): void {
    this.router.navigate(['/']);
  }

  // Clear message when user starts typing
  onFieldChange(): void {
    if (this.message && this.messageType === 'error') {
      this.message = '';
      this.messageType = '';
    }
  }
}