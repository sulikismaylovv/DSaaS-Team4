// app-routing.module.ts
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfileGuard} from './core/guards/profile.guard';
import {DashboardComponent} from './modules/account_module/dashboard/dashboard.component';
import {LoginComponent} from './modules/login/login.component';
import {HomeComponent} from "./modules/homepage_module/home/home.component";
import {AuthComponent} from "./modules/registration_module/auth/auth.component";
import {MultistepformComponent} from "./modules/registration_module/multistepform/multistepform.component";
import {VerifyEmailComponent} from "./modules/registration_module/verify-email/verify-email.component";
import {GameComponent} from "./modules/game_module/game.component";


const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ProfileGuard] },
  { path: 'register', component: AuthComponent, pathMatch: 'full' },
  { path: 'complete-profile', component: MultistepformComponent, pathMatch: 'full'},
  { path: '', redirectTo: '/login', pathMatch: 'full', },
  { path: 'home', component: HomeComponent, pathMatch: 'full'},
  { path: 'verify-email', component: VerifyEmailComponent, pathMatch: 'full'},
  { path: 'game', component:GameComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ProfileGuard]
})
export class AppRoutingModule { }
