import {Component} from '@angular/core';
import {environment} from "../../../environments/environment";
import {FooterService} from "../../core/services/footer.service";

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent {
    title = environment.appTitle;

    constructor(public footerService: FooterService) {
    }


}
