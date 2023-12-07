import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {Router} from '@angular/router';


import {AuthService} from '../../../core/services/auth.service';
import {NavbarService} from "../../../core/services/navbar.service";
import {Session} from "@supabase/supabase-js";
import{CustomAlertComponent} from "../custom-alert/custom-alert.component";
import {catchError, Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {CreatePostComponent} from "../../post_module/create-post/create-post.component";
import {MatDialog} from "@angular/material/dialog";
import {TermsAndConditionsComponent} from "../terms-and-conditions/terms-and-conditions.component";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css'],
})

export class AuthComponent implements OnInit {
    registerForm!: FormGroup;
    loading = false;
    private session: Session | null | undefined;
    termsAccepted = false;
    showAlert = false;
    alertMessage = '';

    constructor(
        protected readonly authService: AuthService,
        private router: Router,
        public navbarService: NavbarService,
        protected dialog: MatDialog,
        private formBuilder: FormBuilder) {
        this.registerForm = this.formBuilder.group({
            email: formBuilder.control('', [Validators.required, Validators.email, Validators.minLength(5)], [this.emailExistsValidator.bind(this)]),
            password: ['', [
                Validators.required,
                Validators.minLength(8), // Minimum length for the password
                Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$') // Passwords must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number,
            ]],
            confirmPassword: ['', Validators.required]
        }, {validator: this.matchingPasswords});

    }
    emailExistsValidator(control: AbstractControl): Observable<ValidationErrors | null> {
      return this.emailExists(control.value).pipe(
        map((exists: boolean) => (exists ? {emailExists: true} : null)),
        catchError(() => of(null))
      );
    }
    private emailExists(email: string): Observable<boolean> {
      return this.authService.checkEmailExists(email);
    }
    termsAcceptedChange() {
        this.termsAccepted = !this.termsAccepted;
    }

    ngOnInit() {
        // Subscribe to the auth state changes
        this.navbarService.setShowNavbar(false);
        this.authService.authChanges((_, session) => (this.session = session));
    }

    matchingPasswords(group: FormGroup): { [key: string]: any } | null {
        const password = group.controls['password'].value;
        const confirmPassword = group.controls['confirmPassword'].value;
        return password === confirmPassword ? null : {'mismatchedPasswords': true};
    }

    // Registration method
    async onRegister(): Promise<void> {
        if (this.registerForm.valid) {
            try {
                this.loading = true;
                const email = this.registerForm.value.email as string;
                const password = this.registerForm.value.password as string;


                // Call the simplified register method without additional details
                await this.authService.register(email, password);
                // After the alert in the register method, control returns here.
                // Navigate to the email verification page
                await this.router.navigate(['/verify-email']);
            } catch (error) {
                if (error instanceof Error) {
                  alert(error.message);
                }
            } finally {
                this.registerForm.reset();
                this.loading = false;
            }
        } else {
            // If the form is not valid, you can handle the errors here
            // For example, you can trigger validation messages in your template
            //alert('Please correct the errors on the form.');
          this.alertMessage = 'Please correct the errors on the form.';
          this.showAlert = true;
          setTimeout(() => this.showAlert = false,6000);
        }
    }

  async signInWithProvider() {
    try {
      await this.authService.signInWithProvider();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

    openTCModal(): void {
      const dialogRef = this.dialog.open(TermsAndConditionsComponent, {
        width: '600px',
        height:'700px',
        data: 0
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }
}
