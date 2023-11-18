// app-routing.module.ts
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfileGuard} from './guards/profile.guard';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from "./pages/home/home.component";
import {AuthComponent} from "./pages/auth/auth.component";
import {MultistepformComponent} from "./pages/registration/multistepform/multistepform.component";
import {LeagueComponent} from "./pages/league/league.component";
import {CreateleagueComponent} from "./pages/createleague/createleague.component";
import {GloballeagueComponent} from "./pages/globalleague/globalleague.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ProfileGuard] },
  { path: 'register', component: AuthComponent, pathMatch: 'full' },
  { path: 'complete-profile', component: MultistepformComponent, pathMatch: 'full'},
  { path: '', redirectTo: '/login', pathMatch: 'full', },
  { path: 'home', component: HomeComponent, pathMatch: 'full'},
  {path : 'league' , component: GloballeagueComponent, pathMatch:'full'},
  {path : 'createleague' , component: CreateleagueComponent, pathMatch:'full'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ProfileGuard]
})
export class AppRoutingModule { }
