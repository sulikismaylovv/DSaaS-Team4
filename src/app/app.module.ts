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
import { ShopComponent } from './modules/shop_module/shop.component';
import {GloballeagueComponent} from "./modules/leagues_module/globalleague/globalleague.component";
import {FriendsleagueComponent} from "./modules/leagues_module/friendsleague/friendsleague.component";
import {LeagueComponent} from "./modules/leagues_module/league/league.component";
import { MatDialogModule } from '@angular/material/dialog';
import {SettingsComponent} from "./modules/settings_module/settings.component";
import {ProfileComponent} from "./modules/profile_module/profile_page/profile.component";
import {CommonComponent} from "./modules/profile_module/common/common.component";
import {UserComponent} from "./modules/profile_module/user/user.component";
import { CustomAlertComponent } from './modules/registration_module/custom-alert/custom-alert.component';
import { NotificationComponent } from './modules/notification-module/notification/notification.component';
import { BgImageSelectorComponent } from './modules/profile_module/bg-image-selector/bg-image-selector.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import 'hammerjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CreateleagueComponent} from "./modules/leagues_module/createleague/createleague.component";
import {TermsAndConditionsComponent} from "./modules/registration_module/terms-and-conditions/terms-and-conditions.component";
import {MomentModule} from "ngx-moment";
import {NavbarService} from "./core/services/navbar.service";
import { ErrorComponent } from './modules/error/error.component';
import {AuthService} from "./core/services/auth.service";
import {ApiService} from "./core/services/api.service";
import {BetsService} from "./core/services/bets.service";
import {ConfigService} from "./core/services/config.service";
import {CreatefriendsleagueService} from "./core/services/createfriendsleague.service";
import {FixtureTransferService} from "./core/services/fixture-transfer.service";
import {FooterService} from "./core/services/footer.service";
import {FriendsLeagueServiceService} from "./core/services/friends-league.service";
import {FriendshipService} from "./core/services/friendship.service";
import {ImageDownloadService} from "./core/services/imageDownload.service";
import {NotificationsService} from "./core/services/notifications.service";
import {PlayerService} from "./core/services/player.service";
import {PostsService} from "./core/services/posts.service";
import {PreferencesService} from "./core/services/preference.service";
import {PurchaseplayerService} from "./core/services/purchaseplayer.service";
import {SupabaseService} from "./core/services/supabase.service";
import {ThemeService} from "./core/services/theme.service";
import {UserServiceService} from "./core/services/user-service.service";
import { DailyAwardComponent } from './modules/homepage_module/daily-award/daily-award.component';
import { HelppageComponent } from './modules/helppage_module/helppage/helppage.component';
import { FAQPageComponentComponent } from './modules/helppage_module/faqpage-component/faqpage-component.component';
import { AsideComponent } from './shared/aside/aside.component';
@NgModule({
    declarations: [
        AppComponent, AuthComponent, LoginComponent, DashboardComponent, HomeComponent
        , TeamComponent, MultistepformComponent, StepperComponent, GameComponent, VerifyEmailComponent, PostsComponent, MatchesComponent, FooterComponent, NavigationComponent, AvatarComponent,
      PostViewComponent, CreatePostComponent, SinglePostComponent, CommentViewComponent, ShopComponent,GloballeagueComponent, FriendsleagueComponent,
      LeagueComponent, SettingsComponent, ProfileComponent, CommonComponent, UserComponent, CustomAlertComponent, NotificationComponent, BgImageSelectorComponent, CreateleagueComponent,
        TermsAndConditionsComponent, ErrorComponent, HelppageComponent, FAQPageComponentComponent,
      LeagueComponent, SettingsComponent, ProfileComponent, CommonComponent, UserComponent, CustomAlertComponent, NotificationComponent, BgImageSelectorComponent, CreateleagueComponent,TermsAndConditionsComponent, ErrorComponent, DailyAwardComponent, AsideComponent
    ],
    imports: [
        BrowserModule, ReactiveFormsModule, AppRoutingModule,
      FormsModule, CommonModule, HttpClientModule, NgOptimizedImage ,
      MatDialogModule, ImageCropperModule, BrowserAnimationsModule, MomentModule
    ],
    providers: [NavbarService, AuthService , ApiService , BetsService , ConfigService , CreatefriendsleagueService,
    FixtureTransferService, FooterService, FriendsLeagueServiceService , FriendshipService , ImageDownloadService,
    NotificationsService, PlayerService, PostsService, PreferencesService, PurchaseplayerService, SupabaseService, ThemeService, UserServiceService],
    bootstrap: [AppComponent],
})
export class AppModule {
}
