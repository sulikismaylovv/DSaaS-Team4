import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {NavigationComponent} from "./navigation/navigation.component";
import {RouterTestingModule} from "@angular/router/testing";
import {FooterComponent} from "./footer/footer.component";

describe('AppComponent', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        declarations: [AppComponent , NavigationComponent , FooterComponent]
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

});
