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
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'

@NgModule({
  declarations: [
    AppComponent, AuthComponent, AccountComponent, AvatarComponent, PostsComponent, MatchesComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, AppRoutingModule, RouterLink, RouterLinkActive, HttpClientModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
