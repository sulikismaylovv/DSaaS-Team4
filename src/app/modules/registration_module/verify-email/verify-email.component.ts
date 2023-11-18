import {Component, OnInit} from '@angular/core';
import {NavbarService} from "../../../core/services/navbar.service";

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit{

  constructor(
    public navbarService: NavbarService
  ) {
  }

  ngOnInit() {
    this.navbarService.setShowNavbar(false);
  }

}
