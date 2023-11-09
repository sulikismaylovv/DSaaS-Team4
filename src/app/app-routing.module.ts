import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes } from '@angular/router';
import {PostsComponent} from "./posts/posts.component";
import {MatchesComponent} from "./matches/matches.component";

const routes: Routes = [
  { path: 'posts', component: PostsComponent },
  { path: 'games', component: MatchesComponent },
  { path: '', redirectTo: '/posts', pathMatch: 'full' }, // Redirect to posts by default
  { path: '**', redirectTo: '/posts', pathMatch: 'full' }, // Redirect to posts for any other route
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
