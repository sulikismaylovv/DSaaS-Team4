import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { AuthService, Profile } from "../../core/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  updateProfileForm!: FormGroup;
  profile!: Profile | null | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfile();
  }

  private initializeForm() {
    this.updateProfileForm = this.formBuilder.group({
      username: [''],
      birthdate: [null],
      first_name: [''],
      last_name: [''],
    });
  }

  private loadProfile() {
    // Directly get the profile from authService
    this.profile = this.authService.getProfile();
    if (this.profile) {
      this.updateProfileForm.patchValue(this.profile);
    }
  }

  async updateProfile(): Promise<void> {
    try {
      this.loading = true;
      const updatedProfile = this.updateProfileForm.value as Profile;
      await this.authService.updateProfile(updatedProfile);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      this.loading = false;
    }
  }

  async signOut() {
    await this.authService.logout();
    await this.router.navigate(['/login']);
  }
}
