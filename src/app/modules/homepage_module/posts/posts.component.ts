// posts.component.ts
import {Component, OnInit} from '@angular/core';
import {PostsService} from 'src/app/core/services/posts.service';
import {Post} from "../../../core/models/posts.model";

@Component({
    selector: 'app-posts',
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
    posts: Post[] = [];

    constructor(private postsService: PostsService) {
    }

    ngOnInit() {
        this.loadPosts();
    }

    loadPosts() {
        this.postsService.getPosts().then(data => {
            this.posts = data;
            //console.log('Posts:', this.posts);
        }).catch(error => {
            console.error('Error loading posts:', error);
        });
    }
}
