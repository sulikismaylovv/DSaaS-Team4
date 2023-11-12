import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { AuthComponent } from './auth/auth.component'
import { AccountComponent } from './account/account.component'
import { ReactiveFormsModule } from '@angular/forms'
import { AvatarComponent } from './avatar/avatar.component';
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
    AppComponent, AuthComponent, AccountComponent, AvatarComponent, LoginComponent, RegisterationComponent, RegisterationclubsComponent, TeamComponent, MultistepformComponent, StepperComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule,FormsModule,CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
