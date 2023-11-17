// app-routing.module.ts
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfileGuard} from './guards/profile.guard';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from "./pages/home/home.component";
import {AuthComponent} from "./pages/registration_module/auth/auth.component";
import {MultistepformComponent} from "./pages/registration_module/multistepform/multistepform.component";
import {VerifyEmailComponent} from "./pages/registration_module/verify-email/verify-email.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ProfileGuard] },
  { path: 'register', component: AuthComponent, pathMatch: 'full' },
  { path: 'complete-profile', component: MultistepformComponent, pathMatch: 'full'},
  { path: '', redirectTo: '/login', pathMatch: 'full', },
  { path: 'home', component: HomeComponent, pathMatch: 'full'},
  { path: 'verify-email', component: VerifyEmailComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ProfileGuard]
})
export class AppRoutingModule { }
