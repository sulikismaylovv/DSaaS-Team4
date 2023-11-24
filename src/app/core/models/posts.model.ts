export interface Post {
    id?: number;
    user_id: string; // Use UUID if that's the type in your database
    content: string;
    image_url?: string; // Optional since not all posts have images
    created_at: Date;
    original_post_id?: number;
}

export interface Like {
    id?: number;
    user_id: string;
    post_id: number;
    created_at: Date;
}

export interface Comment {
    id?: number;
    post_id: number;
    user_id: string;
    content: string;
    created_at: Date;
}

export class Posts {

}
