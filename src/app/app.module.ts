import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './pages/main/app.component'
import { AuthComponent } from './pages/auth/auth.component'
import { ReactiveFormsModule } from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component'
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { FormsModule } from '@angular/forms';
import {CommonModule} from "@angular/common";
import { RegisterationclubsComponent } from './registerationclubs/registerationclubs.component';
import { TeamComponent } from './team/team.component';
import { MultistepformComponent } from './multistepform/multistepform.component';
import { StepperComponent } from './stepper/stepper.component';


@NgModule({
  declarations: [
    AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
    ,RegisterationComponent, RegisterationclubsComponent, TeamComponent, MultistepformComponent, StepperComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule,FormsModule,CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
