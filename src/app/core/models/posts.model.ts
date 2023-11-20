export interface Post {
    id?: number;
    user_id: string; // Use UUID if that's the type in your database
    content: string;
    image_url?: string; // Optional since not all posts have images
    created_at: Date;
}

export interface Like {
    id?: number;
    userId: string;
    postId: number;
    createdAt: Date;
}

export interface Comment {
    id?: number;
    postId: number;
    userId: string;
    content: string;
    createdAt: Date;
}

export interface Retweet {
    id?: number;
    originalPostId: number;
    retweetUserId: string;
    createdAt: Date;
}

export class Posts {

}
