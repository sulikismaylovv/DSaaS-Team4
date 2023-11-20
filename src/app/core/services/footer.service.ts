import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FooterService {
    private showFooterSubject = new BehaviorSubject<boolean>(false);

    // You can directly use this observable in your template with the async pipe
    public showFooter$ = this.showFooterSubject.asObservable();

    constructor() {
    }

    public setShowFooter(show: boolean): void {
        this.showFooterSubject.next(show);
    }
}
