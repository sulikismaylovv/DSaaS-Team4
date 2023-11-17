import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {AppComponent} from './shared/app.component'
import {AuthComponent} from './modules/registration_module/auth/auth.component'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './modules/login/login.component';
import {DashboardComponent} from './modules/account_module/dashboard/dashboard.component';
import {HomeComponent} from './modules/homepage_module/home/home.component'
import {CommonModule} from "@angular/common";
import {TeamComponent} from './modules/registration_module/team/team.component';
import {MultistepformComponent} from './modules/registration_module/multistepform/multistepform.component';
import {StepperComponent} from './modules/registration_module/stepper/stepper.component';
import { VerifyEmailComponent } from './modules/registration_module/verify-email/verify-email.component';
import { GameComponent } from './pages/game/game.component';



@NgModule({
  declarations: [
    AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
    , TeamComponent, MultistepformComponent, StepperComponent, GameComponent, VerifyEmailComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule, FormsModule, CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
