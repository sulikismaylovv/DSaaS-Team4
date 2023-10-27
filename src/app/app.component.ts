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
    this.title = environment.appTitle;
    initFlowbite();
  }

  hideForm = true;
  toggle() {
    this.hideForm = !this.hideForm;
  }



}
