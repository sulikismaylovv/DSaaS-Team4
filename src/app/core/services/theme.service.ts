import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
  private darkMode=false;
  constructor() {
    // Load dark mode setting from local storage
    const savedMode = localStorage.getItem('darkMode');
    // If the user has explicitly chosen light or dark
    if (savedMode) {
      this.darkMode = savedMode === 'true';
    } else {
      // Optionally set a default or detect from system preferences
      // Example: Use system preference
      this.darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.updateDocumentClass();
  }
  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.updateDocumentClass();
  }
  private updateDocumentClass() {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  isDarkModeEnabled(): boolean {
    return this.darkMode;
  }
}

