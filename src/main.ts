import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';


import {AppModule} from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AuthService } from './app/core/services/auth.service';

// Extend the Window interface with the custom property
interface CustomWindow extends Window {
  userId: string | null;
}

// Declare the global variable with the extended interface
declare var window: CustomWindow;

if (environment.production) {
  enableProdMode();
}

// Bootstrap the AppModule
platformBrowserDynamic().bootstrapModule(AppModule)
  .then(moduleRef => {
    const authService = moduleRef.injector.get(AuthService);

    // Fetch the session from AuthService
    authService.restoreSession().then(() => {
      const session = authService.session;

      // Set a global variable with the user id
      window.userId = session?.user?.id || null;

      console.log('Session:', window.userId);
    });
  })
  .catch(err => console.error(err));
