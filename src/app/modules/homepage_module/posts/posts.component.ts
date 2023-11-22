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
        const original = await this.postsService.getRetweetContentByPostId(r.original_post_id);
        return {
          ...r,
          isRetweet: true,
          retweet_user_id: r.retweet_user_id,
          original_post_id: r.original_post_id,
          retweet_content: r.retweet_content,
          retweet_created_at: r.created_at,
          content: original.content, // Now this is a string as expected
          // Ensure you provide all necessary properties to match the PostWithRetweet type
          user_id: original.user_id,
          created_at: original.created_at,
          image_url: original.image_url
        };
      });

      // Resolve all promises from the map to get the complete array of retweets
      const retweets = await Promise.all(retweetPromises);
        // Combine posts and retweets into one array
        this.posts = [...posts, ...retweets];

        // Sort the combined array
        this.posts.sort((a, b) => {
            // Ensure the dates are defined, otherwise default to the current date
            let dateA = a.isRetweet && a.retweet_created_at ? new Date(a.retweet_created_at) : new Date(a.created_at ?? new Date());
            let dateB = b.isRetweet && b.retweet_created_at ? new Date(b.retweet_created_at) : new Date(b.created_at ?? new Date());

            return dateB.getTime() - dateA.getTime(); // Sort in descending order
        });

    }
  }
