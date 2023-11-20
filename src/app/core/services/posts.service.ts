import { Injectable } from '@angular/core';
import { Like, Post, Retweet, Comment } from "../models/posts.model";
import {SupabaseService} from "./supabase.service";

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  constructor(private supabase: SupabaseService) {}

  // Fetch all posts
  async getPosts(): Promise<Post[]> {
    try {
      const { data, error } = await this.supabase.supabaseClient
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
  async createPost(post: Post , file: File): Promise<Post> {
    try {
      // If there's an image, handle the upload first
      if (file) {
        post.imageUrl = await this.uploadImage(file);
      }

      const { data, error } = await this.supabase.supabaseClient
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
  async uploadImage(file: File): Promise<string> {
    const path = `post-images/${Date.now()}-${file.name}`;

    const { error } = await this.supabase.supabaseClient.storage
      .from('post-images')
      .upload(path, file);

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Get the public URL for the newly uploaded file
    const { data } = this.supabase.supabaseClient.storage
      .from('post-images')
      .getPublicUrl(path);

    if (data) {
      console.error('Error getting public URL:', data);
      throw data;
    }



    return data;
  }

  // Like a post
  async likePost(like: Like): Promise<Like> {
    try {
      const { data, error } = await this.supabase.supabaseClient
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
      const { error } = await this.supabase.supabaseClient
        .from('likes')
        .delete()
        .match({ id: likeId });

      if (error) throw error;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  // Add a comment to a post
  async addComment(comment: Comment): Promise<Comment> {
    try {
      const { data, error } = await this.supabase.supabaseClient
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
      const { data, error } = await this.supabase.supabaseClient
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
