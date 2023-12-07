import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    getFullUrl(path: string): string {
        // Check if the base URL is for localhost and use http if true
      const protocol = environment.baseUrl.includes('localhost') ? 'https://' : 'https://';
        const baseUrl = environment.baseUrl.startsWith('http')
            ? environment.baseUrl
            : `${protocol}${environment.baseUrl}`;
        const finalUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        const fullPath = `${finalUrl}${path}`;
        console.log('Full URL:', fullPath);
        return fullPath;
    }
}
