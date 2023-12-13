import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';



@Injectable({
  providedIn: 'root'
})
export class PurchaseplayerService {

  constructor(private supabase: SupabaseService) { }
}
