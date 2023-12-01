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
import {ShopComponent} from "./modules/shop/shop.component";
import {GloballeagueComponent} from "./modules/leagues/globalleague/globalleague.component";
import {ProfileComponent} from "./modules/profile_module/profile_page/profile.component";
import {UserComponent} from "./modules/profile_module/user/user.component";
import {SettingsComponent} from "./modules/settings/settings.component";


const routes: Routes = [
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
    {path: 'dashboard', component: DashboardComponent, canActivate: [ProfileGuard]},
    {path: 'register', component: AuthComponent, pathMatch: 'full'},
    {path: 'complete-profile', component: MultistepformComponent, pathMatch: 'full'},
    {path: '', redirectTo: '/home', pathMatch: 'full',},
    {path: 'home', component: HomeComponent, pathMatch: 'full'},
    {path: 'verify-email', component: VerifyEmailComponent, pathMatch: 'full'},
    {path: 'game/:id', component: GameComponent, pathMatch: 'full'},
    {path: 'posts', component: PostsComponent},
    {path: 'games', component: MatchesComponent},
    { path: 'post/:id', component: SinglePostComponent },
    { path: 'shop', component: ShopComponent },
    {path: 'league',component: GloballeagueComponent},
  { path: 'profile', component: ProfileComponent, canActivate: [ProfileGuard]},
  { path: 'user', component: UserComponent},
  { path: 'settings', component: SettingsComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [ProfileGuard]
})
export class AppRoutingModule {
}
