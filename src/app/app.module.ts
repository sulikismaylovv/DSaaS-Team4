import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './pages/main/app.component'
import { AuthComponent } from './pages/auth/auth.component'
import { ReactiveFormsModule } from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component'
import { AvatarComponent } from './avatar/avatar.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterationComponent } from './registeration/registeration.component';
import { Registeration2Component } from './registeration2/registeration2.component'
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
    AppComponent, AuthComponent, AccountComponent, AvatarComponent, LoginComponent, RegisterationComponent, Registeration2Component
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule,FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
