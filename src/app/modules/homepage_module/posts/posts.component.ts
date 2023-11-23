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

    async loadPosts() {
        try {
            let posts = await this.postsService.getPosts();

            // Sort posts based on sortDate
            this.posts = posts.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    async getOriginalPostDate(original_post_id: number): Promise<Date> {
        const originalPost = await this.postsService.getOriginalPost(original_post_id);
        return new Date(originalPost.created_at);
    }
}
