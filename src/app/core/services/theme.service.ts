import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;
  private mediaQueryListener!: MediaQueryList;

  constructor() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      this.darkMode = savedMode === 'true';
    } else {
      this.setupSystemThemeListener();
    }
    this.updateDocumentClass();
  }

  private setupSystemThemeListener() {
    this.mediaQueryListener = window.matchMedia('(prefers-color-scheme: dark)');
    this.darkMode = this.mediaQueryListener.matches;
    this.mediaQueryListener.addEventListener('change', this.systemThemeChanged.bind(this));
  }

  private systemThemeChanged(event: MediaQueryListEvent) {
    this.darkMode = event.matches;
    this.updateDocumentClass();
    // Optionally, save this setting to localStorage if you want
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

  // Clean up the listener when the service is destroyed
  ngOnDestroy() {
    this.mediaQueryListener.removeEventListener('change', this.systemThemeChanged.bind(this));
  }
}


