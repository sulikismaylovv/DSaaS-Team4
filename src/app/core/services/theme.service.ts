import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkMode = true;

    toggleTheme() {
        this.darkMode = !this.darkMode;
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

