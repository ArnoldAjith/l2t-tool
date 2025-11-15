import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Api } from '../api';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  isSubmitting = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private api: Api,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      mailId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@ducimaanalytics\.com$/)]],
      employeeId: ['', [Validators.required]],
      designation: ['', Validators.required],
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  // Get form control for easier access in template
  getControl(name: string) {
    return this.registerForm.get(name);
  }

  // Check if field has error
  hasError(fieldName: string, errorType: string): boolean {
    const control = this.getControl(fieldName);
    return !!(control && control.errors && control.errors[errorType] && control.touched);
  }

  // Submit form
  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.message = '';

      // Create FormData object
      const formData = new FormData();
      const formValues = this.registerForm.value;

      // Append all form fields to FormData
      formData.append('username', formValues.userName);
      formData.append('password', formValues.password);
      formData.append('confirmPassword', formValues.confirmPassword);
      formData.append('mailId', formValues.mailId);
      formData.append('employeeId', formValues.employeeId);
      formData.append('designation', formValues.designation);

      console.log('FormData being sent:');
      formData.forEach((value, key) => {
        console.log(key, value);
      });


      // const apiUrl = 'http://localhost:8080/login/register';
      const apiUrl = 'https://datteamwork.com:8063/login/register';
      // const apiUrl = 'https://tagbees.com:8063/login/register';

      this.http.post(apiUrl, formData).subscribe({
        next: (response) => {
          this.message = 'Registration successful!';
          this.messageType = 'success';
          this.registerForm.reset();
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.message = error.error?.message || 'Registration failed. Please try again.';
          this.messageType = 'error';
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.registerForm.markAllAsTouched();
      this.message = 'Please fill in all required fields correctly.';
      this.messageType = 'error';
    }
  }

  // Reset form
  resetForm() {
    this.registerForm.reset();
    this.message = '';
    this.messageType = '';
  }
}
