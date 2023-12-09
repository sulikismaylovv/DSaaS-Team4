import { Injectable } from '@angular/core';
import { SupabaseService } from 'src/app/core/services/supabase.service';

export interface Notification {
  id?: number;
  user_id: string;
  title?: string;
  text: string;
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private supabase: SupabaseService) {}

  async createNotification(userId: string, text: string, title: string): Promise<Notification | null> {
    const { data, error } = await this.supabase.supabaseClient
      .from('notifications')
      .insert([{ user_id: userId, title: title, text: text  }]);

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    if(!data) {
      console.error('Error creating notification: no data returned');
      return null;
    }
    return data[0];
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase.supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error retrieving notifications:', error);
      return [];
    }
    return data;
  }

  async deleteNotification(notificationId: number): Promise<boolean> {
    const { data, error } = await this.supabase.supabaseClient
      .from('notifications')
      .delete()
      .match({ id: notificationId });

    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    if(!data) {
      console.error('Error deleting notification: no data returned');
      return false;
    }
    return true;
  }

  async updateNotification(notificationId: number, newText: string , newTitle: string): Promise<Notification | null> {
    const { data, error } = await this.supabase.supabaseClient
      .from('notifications')
      .update({ text: newText , title: newTitle })
      .match({ id: notificationId });

    if (error) {
      console.error('Error updating notification:', error);
      return null;
    }
    if(!data) {
      console.error('Error updating notification: no data returned');
      return null;
    }
    return data[0];
  }
}
