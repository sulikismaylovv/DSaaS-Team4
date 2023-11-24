import {Injectable} from '@angular/core';
import {Comment, Like, Post} from "../models/posts.model";
import {SupabaseService} from "./supabase.service";

@Injectable({
    providedIn: 'root'
})
export class PostsService {

    constructor(private supabase: SupabaseService) {
    }



    // Fetch all posts
    async getPosts(): Promise<Post[]> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('posts')
                .select('*');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    // Create a new post
    async createPost(post: Post, file: File | null, filePath: string): Promise<Post> {
        let imageUrl;
        try {
            // If there's an image, handle the upload first
            if (file) {
                imageUrl = await this.uploadImage(filePath, file);
                post.image_url = filePath;
            }

            const {data, error} = await this.supabase.supabaseClient
                .from('posts')
                .upsert([post])
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    // Upload an image and return the URL
    async uploadImage(filePath: string, file: File): Promise<{ publicUrl: string }> {

        const {error} = await this.supabase.supabaseClient.storage
            .from('post-images')
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading image:', error);
            throw error;
        }

        // Get the public URL for the newly uploaded file
        const {data} = this.supabase.supabaseClient.storage
            .from('post-images')
            .getPublicUrl(filePath);

        if (!data) {
            console.error('Error getting public URL:', data);
            throw data;
        }


        return data;
    }

    // Download an image
    async downLoadImage(filePath: string): Promise<Blob | null> {
        const {data, error} = await this.supabase.supabaseClient.storage
            .from('post-images')
            .download(filePath);

        if (error) {
            console.error('Error downloading image:', error);
            throw error;
        }

        return data;
    }

    async downLoadImageRetweet(filePath: string): Promise<Blob | null> {
        const {data, error} = await this.supabase.supabaseClient.storage
            .from('avatars')
            .download(filePath);

        if (error) {
            console.error('Error downloading image:', error);
            throw error;
        }

        return data;
    }

    async getPostById(postId: number): Promise<Post> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('posts')
                .select('*')
                .match({id: postId});

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    }

    // Like a post
    async likePost(like: Like): Promise<Like> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('likes')
                .insert([like])
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error liking post:', error);
            throw error;
        }
    }

    // Unlike a post
    async unlikePost(like: Like): Promise<void> {
        try {
            const {error} = await this.supabase.supabaseClient
                .from('likes')
                .delete()
                .match({post_id: like.post_id, user_id: like.user_id});

            if (error) throw error;
        } catch (error) {
            console.error('Error unliking post:', error);
            throw error;
        }
    }

    async getNumberOfLikes(postId: number): Promise<number> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('likes')
                .select('id')
                .match({post_id: postId});

            if (error) throw error;
            return data.length;
        } catch (error) {
            console.error('Error getting number of likes:', error);
            throw error;
        }
    }


    async checkIfLiked(postId: number, userId: string): Promise<boolean> {
      try{
        const {data, error} = await this.supabase.supabaseClient
          .from('likes')
          .select('id')
          .match({post_id: postId, user_id: userId});

        if(error) throw error;
        return data.length > 0;
      }
      catch(error) {
        console.error('Error checking if liked:', error);
        throw error;
      }
    }


    // Add a comment to a post
    async addComment(comment: Comment): Promise<Comment> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('comments')
                .upsert([comment])
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error commenting on post:', error);
            throw error;
        }
    }

    async getNumberOfComments(postId: number): Promise<number> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('comments')
                .select('id')
                .match({post_id: postId});

            if (error) throw error;
            return data.length;
        } catch (error) {
            console.error('Error getting number of comments:', error);
            throw error;
        }
    }

    async getCommentsByPostId(postId: number): Promise<Comment[]> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('comments')
                .select('*')
                .match({post_id: postId});

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    async getOriginalPost(original_post_id: number): Promise<Post> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('posts')
                .select('*')
                .match({id: original_post_id});

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error fetching original post:', error);
            throw error;
        }
    }

    async getNumberOfRetweets(postId: number): Promise<number> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('posts')
                .select('id', { count: 'exact' }) // Use the count parameter for exact counts
                .match({original_post_id: postId});

            if (error) throw error;
            // The count property on the result will have the number of matched records
            return data.length; // Or use data.count if you've enabled count in select
        } catch (error) {
            console.error('Error getting number of retweets:', error);
            throw error;
        }
    }



    // Additional methods can be implemented as needed to handle other post interactions.
}
