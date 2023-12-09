import { Component, OnInit, OnDestroy } from '@angular/core';
import {NavbarService} from "../../core/services/navbar.service";

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit, OnDestroy {

  constructor(private navbarService: NavbarService) {}

  ngOnInit() {
    // Hide the navbar when this component initializes
    this.navbarService.setShowNavbar(false);
  }

  ngOnDestroy() {
    // Optionally, show the navbar again when leaving the error page
    this.navbarService.setShowNavbar(true);
  }
}
