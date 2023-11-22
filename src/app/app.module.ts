import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {AppComponent} from './shared/app.component'
import {AuthComponent} from './modules/registration_module/auth/auth.component'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './modules/login/login.component';
import {DashboardComponent} from './modules/account_module/dashboard/dashboard.component';
import {HomeComponent} from './modules/homepage_module/home/home.component'
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {TeamComponent} from './modules/registration_module/team/team.component';
import {MultistepformComponent} from './modules/registration_module/multistepform/multistepform.component';
import {StepperComponent} from './modules/registration_module/stepper/stepper.component';
import {VerifyEmailComponent} from './modules/registration_module/verify-email/verify-email.component';
import {GameComponent} from './modules/game_module/game.component';
import {HttpClientModule} from '@angular/common/http'
import {PostsComponent} from "./modules/homepage_module/posts/posts.component";
import {MatchesComponent} from "./modules/homepage_module/matches/matches.component";
import { FooterComponent } from './shared/footer/footer.component';
import { NavigationComponent } from './shared/navigation/navigation.component';
import { ProfileComponent } from './modules/profile_module/profile_page/profile.component';
import { CommonComponent } from './modules/profile_module/common/common.component';
import { UserComponent } from './modules/profile_module/user/user.component';


@NgModule({
  declarations: [
    AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
    , TeamComponent, MultistepformComponent, StepperComponent, GameComponent, VerifyEmailComponent, PostsComponent, MatchesComponent, FooterComponent, NavigationComponent, ProfileComponent, CommonComponent, UserComponent,
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule, FormsModule, CommonModule, HttpClientModule, NgOptimizedImage
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
