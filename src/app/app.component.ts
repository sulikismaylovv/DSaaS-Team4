import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './supabase.service'
import { initFlowbite } from 'flowbite';
import { environment } from '../environments/environment';
import { inject } from '@vercel/analytics';





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title: string = "Default Title";

  session = this.supabase.session
  constructor(private readonly supabase: SupabaseService) {}
  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session))

    // Set the title based on the environment
    if (environment.production) {
      this.title = process.env['APP_TITLE'] ? process.env['APP_TITLE'] : 'My Title (production)';
    } else {
      this.title = process.env['APP_TITLE_PREVIEW'] || 'My Title (preview)';
    }
    initFlowbite();
  }

  hideForm = true;
  toggle() {
    this.hideForm = !this.hideForm;
  }



}
