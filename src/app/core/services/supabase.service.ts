  import { Injectable } from '@angular/core';
  import {
    createClient,
    SupabaseClient,
  } from '@supabase/supabase-js';
  import { environment } from 'src/environments/environment';


  @Injectable({
    providedIn: 'root',
  })
  export class SupabaseService {
    public supabase: SupabaseClient;
    constructor() {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }
  }
