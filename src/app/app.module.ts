import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {AppComponent} from './pages/main/app.component'
import {AuthComponent} from './pages/auth/auth.component'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './pages/login/login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {HomeComponent} from './pages/home/home.component'
import {CommonModule} from "@angular/common";
import {TeamComponent} from './pages/registration/team/team.component';
import {MultistepformComponent} from './pages/registration/multistepform/multistepform.component';
import {StepperComponent} from './pages/registration/stepper/stepper.component';
import { GameComponent } from './pages/game/game.component';
import { HttpClientModule } from '@angular/common/http'


@NgModule({
  declarations: [
    AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
    , TeamComponent, MultistepformComponent, StepperComponent, GameComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule, FormsModule, CommonModule, HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
