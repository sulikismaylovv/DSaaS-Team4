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
import {FooterComponent} from './shared/footer/footer.component';
import {NavigationComponent} from './shared/navigation/navigation.component';
import {AvatarComponent} from './modules/account_module/avatar/avatar.component';
import {PostViewComponent} from './modules/post_module/post-view/post-view.component';
import {CreatePostComponent} from './modules/post_module/create-post/create-post.component';
import { SinglePostComponent } from './modules/post_module/single-post/single-post.component';
import { CommentViewComponent } from './modules/post_module/comment-view/comment-view.component';
import { ShopComponent } from './modules/shop/shop.component';
import {GloballeagueComponent} from "./modules/leagues/globalleague/globalleague.component";
import {FriendsleagueComponent} from "./modules/leagues/friendsleague/friendsleague.component";
import {LeagueComponent} from "./modules/leagues/league/league.component";
import { MatDialogModule } from '@angular/material/dialog';
import {SettingsComponent} from "./modules/settings/settings.component";
import {ProfileComponent} from "./modules/profile_module/profile_page/profile.component";
import {CommonComponent} from "./modules/profile_module/common/common.component";
import {UserComponent} from "./modules/profile_module/user/user.component";
import { CustomAlertComponent } from './modules/registration_module/custom-alert/custom-alert.component';
import { NotificationComponent } from './modules/notification-module/notification/notification.component';
import { BgImageSelectorComponent } from './modules/profile_module/bg-image-selector/bg-image-selector.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import 'hammerjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CreateleagueComponent} from "./modules/leagues/createleague/createleague.component";



@NgModule({
    declarations: [
        AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
        , TeamComponent, MultistepformComponent, StepperComponent, GameComponent, VerifyEmailComponent, PostsComponent, MatchesComponent, FooterComponent, NavigationComponent, AvatarComponent,
      PostViewComponent, CreatePostComponent, SinglePostComponent, CommentViewComponent, ShopComponent,GloballeagueComponent, FriendsleagueComponent,
      LeagueComponent, SettingsComponent, ProfileComponent, CommonComponent, UserComponent, CustomAlertComponent, NotificationComponent, BgImageSelectorComponent, CreateleagueComponent
    ],
    imports: [
        BrowserModule, ReactiveFormsModule, AppRoutingModule,
      FormsModule, CommonModule, HttpClientModule, NgOptimizedImage ,
      MatDialogModule, ImageCropperModule, BrowserAnimationsModule
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
}
