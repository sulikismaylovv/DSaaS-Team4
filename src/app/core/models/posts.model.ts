export interface Post {
    id?: number;
    user_id: string; // Use UUID if that's the type in your database
    content: string;
    image_url?: string; // Optional since not all posts have images
    created_at: Date;
}

export interface Like {
    id?: number;
    user_id: string;
    post_id: number;
    createdAt: Date;
}

export interface Comment {
    id?: number;
    post_id: number;
    user_id: string;
    content: string;
    createdAt: Date;
}

export interface Retweet {
    id?: number;
    original_post_id: number;
    retweet_user_id: string;
    createdAt: Date;
}

export class Posts {

}
