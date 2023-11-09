import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { AuthComponent } from './auth/auth.component'
import { AccountComponent } from './account/account.component'
import { ReactiveFormsModule } from '@angular/forms'
import { AvatarComponent } from './avatar/avatar.component';
import { AppRoutingModule } from './app-routing.module';
import { PostsComponent } from './posts/posts.component'
import {RouterLink, RouterLinkActive} from "@angular/router";
import { MatchesComponent } from './matches/matches.component';

@NgModule({
  declarations: [
    AppComponent, AuthComponent, AccountComponent, AvatarComponent, PostsComponent, MatchesComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule, RouterLink, RouterLinkActive
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
