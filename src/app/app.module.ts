import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {AppComponent} from './pages/main/app.component'
import {AuthComponent} from './pages/registration_module/auth/auth.component'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './pages/login/login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {HomeComponent} from './pages/home/home.component'
import {CommonModule} from "@angular/common";
import {TeamComponent} from './pages/registration_module/team/team.component';
import {MultistepformComponent} from './pages/registration_module/multistepform/multistepform.component';
import {StepperComponent} from './pages/registration_module/stepper/stepper.component';
import { VerifyEmailComponent } from './pages/registration_module/verify-email/verify-email.component';


@NgModule({
  declarations: [
    AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
    , TeamComponent, MultistepformComponent, StepperComponent, VerifyEmailComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule, FormsModule, CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
