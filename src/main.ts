import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';


import {AppModule} from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AuthService } from './app/core/services/auth.service';




  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

  if (environment.production) {
    enableProdMode();
  }
// // Bootstrap the AppModule
// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));
//
// //Fetch the session from AuthService
// platformBrowserDynamic().bootstrapModule(AppModule)
//   .then(moduleRef => {
//     const authService = moduleRef.injector.get(AuthService);
//     const session = authService.session;
//
//     // Use the session as needed (e.g., send it to Google Analytics)
//     if (session) {
//       // Send session to Google Analytics or perform other actions
//       console.log('Session:', session.user.id);
//       // Your Google Analytics code here
//     }
//   })
//   .catch(err => console.error(err));
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

      // Bootstrap the AppModule after setting the global variable
      platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
    });
  })
  .catch(err => console.error(err));
