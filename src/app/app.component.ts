import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './supabase.service'
import { initFlowbite } from 'flowbite';
import { environment } from '../environments/environment';
import { ApiService } from './services/api.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = environment.appTitle;
  session = this.supabase.session  

  constructor(private readonly supabase: SupabaseService, private apiService: ApiService) {}
  // constructor(private readonly supabase: SupabaseService) {}

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session))
    initFlowbite();
  }

  hideForm = true;
  toggle() {
    this.hideForm = !this.hideForm;
  }
}
