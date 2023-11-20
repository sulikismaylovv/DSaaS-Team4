import {Injectable} from '@angular/core';
import {Comment, Like, Post, Retweet} from "../models/posts.model";
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
    async createPost(post: Post, file: File, filePath: string): Promise<Post> {
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
    async unlikePost(likeId: number): Promise<void> {
        try {
            const {error} = await this.supabase.supabaseClient
                .from('likes')
                .delete()
                .match({id: likeId});

            if (error) throw error;
        } catch (error) {
            console.error('Error unliking post:', error);
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

    // Retweet a post
    async retweetPost(retweet: Retweet): Promise<Retweet> {
        try {
            const {data, error} = await this.supabase.supabaseClient
                .from('retweets')
                .upsert([retweet])
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error retweeting post:', error);
            throw error;
        }
    }

    // Additional methods can be implemented as needed to handle other post interactions.
}
