import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './supabase.service'
import { initFlowbite } from 'flowbite';
import { environment } from '../environments/environment';
import { inject } from '@vercel/analytics';
import { ThemeService } from './theme.service';





@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = environment.appTitle;

  session = this.supabase.session
  constructor(private readonly supabase: SupabaseService, public themeService: ThemeService) {}
  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session))
    initFlowbite();
  }

  hideForm = true;
  toggle() {
    this.hideForm = !this.hideForm;
  }
  toggleTheme() {
    this.themeService.toggleTheme();
  }



}
