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
import {PostsComponent} from "./modules/homepage_module/posts/posts.component";
import {MatchesComponent} from "./modules/homepage_module/matches/matches.component";
import {SinglePostComponent} from "./modules/post_module/single-post/single-post.component";
import {ShopComponent} from "./modules/shop_module/shop.component";
import {GloballeagueComponent} from "./modules/leagues_module/globalleague/globalleague.component";
import {SettingsComponent} from "./modules/settings_module/settings.component";
import {ProfileComponent} from "./modules/profile_module/profile_page/profile.component";
import {NotificationComponent} from "./modules/notification-module/notification/notification.component";
import {FirstSignGuard} from "./core/guards/first-sign.guard";
import {ErrorComponent} from "./modules/error/error.component";
import {FAQPageComponentComponent} from "./modules/helppage_module/faqpage-component/faqpage-component.component";


const routes: Routes = [
  { path: 'login', component: LoginComponent, pathMatch: 'full'},
  { path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [ProfileGuard]},
  { path: 'register', component: AuthComponent, pathMatch: 'full'},
  { path: 'complete-profile', component: MultistepformComponent, pathMatch: 'full'},
  { path: '', redirectTo: '/home', pathMatch: 'full',},
  { path: 'home', component: HomeComponent, pathMatch: 'full'},
  { path: 'verify-email', component: VerifyEmailComponent, pathMatch: 'full'},
  {path: 'game/:id', component: GameComponent, pathMatch: 'full', canActivate: [ProfileGuard]},
  { path: 'posts', component: PostsComponent, pathMatch: 'full'},
  { path: 'games', component: MatchesComponent, pathMatch: 'full'},
  {path: 'post/:id', component: SinglePostComponent, canActivate: [ProfileGuard]},
  { path: 'shop', component: ShopComponent, pathMatch: 'full' },
  {path: 'league', component: GloballeagueComponent, pathMatch: 'full', canActivate: [ProfileGuard]},
  { path: 'settings', component: SettingsComponent, canActivate: [ProfileGuard], pathMatch: 'full'},
  { path: 'profile', component: ProfileComponent, canActivate: [ProfileGuard, FirstSignGuard]},
  {path: 'profile/:userId', component: ProfileComponent, canActivate: [ProfileGuard]},
  { path: 'notifications', component: NotificationComponent, canActivate: [ProfileGuard]},
  {path:'help', component: FAQPageComponentComponent, pathMatch: 'full'},
  { path: '**', component: ErrorComponent, pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [ProfileGuard]
})
export class AppRoutingModule {
}
