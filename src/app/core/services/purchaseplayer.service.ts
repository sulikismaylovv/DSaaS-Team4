import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {AuthService} from "./auth.service";



@Injectable({
  providedIn: 'root'
})
export class PurchaseplayerService {

  constructor(private supabase: SupabaseService) { }
}
