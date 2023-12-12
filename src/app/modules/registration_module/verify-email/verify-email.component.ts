import {Component, OnInit} from '@angular/core';
import {NavbarService} from "../../../core/services/navbar.service";
import {AuthService} from "../../../core/services/auth.service";
import {timer} from "rxjs";

@Component({
    selector: 'app-verify-email',
    templateUrl: './verify-email.component.html',
    styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  email: string | null = null;
  secondsCounter = 45; // start from 45 seconds
  canResendEmail = false;


  constructor(
        public navbarService: NavbarService,
        private readonly authService: AuthService
    ) {
    }

    ngOnInit() {
        this.navbarService.setShowNavbar(false);
      this.authService.getCurrentUserEmail().subscribe(email => this.email = email);
      this.startResendTimer();

    }

  startResendTimer() {
    const resendTimer$ = timer(1000, 1000);
    const subscription = resendTimer$.subscribe(sec => {
      this.secondsCounter--;

      if (this.secondsCounter === 0) {
        this.canResendEmail = true;
        subscription.unsubscribe();
      }
    });
  }

    async resendEmail() {
      if (this.email) {
        await this.authService.resendVerificationEmail();
      } else {
        alert('Email not found');
      }
    }

}
