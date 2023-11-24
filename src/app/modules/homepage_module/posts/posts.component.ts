  // posts.component.ts
  import {Component, OnInit} from '@angular/core';
  import {PostsService} from 'src/app/core/services/posts.service';
  import {Post , PostWithRetweet} from "../../../core/models/posts.model";


  @Component({
      selector: 'app-posts',
      templateUrl: './posts.component.html',
      styleUrls: ['./posts.component.css']
  })
  export class PostsComponent implements OnInit {
      posts: PostWithRetweet[] = [];

      constructor(private postsService: PostsService) {
      }

      ngOnInit() {
          this.loadPosts();
      }

    async loadPosts() {
      // Fetch normal posts
      const posts = await this.postsService.getPosts();

      // Fetch retweets and await the resolution of asynchronous operations within the map

      const retweetPromises = (await this.postsService.getRetweets()).map(async r => {
        // Await the asynchronous call to get the retweet content
        const content = await this.postsService.getRetweetContentByPostId(r.original_post_id);
        return {
          ...r,
          isRetweet: true,
          retweet_user_id: r.retweet_user_id,
          original_post_id: r.original_post_id,
          content: content, // Now this is a string as expected
          // Ensure you provide all necessary properties to match the PostWithRetweet type
          user_id: r.retweet_user_id, // Assuming the retweet_user_id can be used as the user_id
          // Other properties as necessary...
        };
      });

      // Resolve all promises from the map to get the complete array of retweets
      const retweets = await Promise.all(retweetPromises);
      // Combine them into one array and sort by created_at or any other criteria
      this.posts = [...posts, ...retweets].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
  }
