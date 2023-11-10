// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileGuard } from './guards/profile.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import {AppComponent} from "./pages/main/app.component";

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [ProfileGuard] },
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: '',component: AppComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
