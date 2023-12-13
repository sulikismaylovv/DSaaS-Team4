import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { UserServiceService } from "../../../core/services/user-service.service";
import { AuthService } from "../../../core/services/auth.service";
declare let gtag: Function;
@Component({
  selector: "app-daily-award",
  templateUrl: "./daily-award.component.html",
  styleUrls: ["./daily-award.component.css"],
})
export class DailyAwardComponent implements OnInit{
  isRecentlyLogged = true;

  constructor(
    public dialogRef: MatDialogRef<DailyAwardComponent>,
    private userService: UserServiceService,
    private authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.updateRecentlyLoggedStatus();
    if(this.isRecentlyLogged) {
      this.close();
    }
  }

  close(): void {
    this.dialogRef.close();
    this.trackButtonClick1();
  }

  private async updateRecentlyLoggedStatus(): Promise<void> {
    const userId = this.authService.session?.user?.id;

    if (!userId) {
      console.log("User ID is undefined.");
      return;
    }

    try {
      this.isRecentlyLogged = await this.userService.checkIfRecentlyLogged(userId);
      await this.userService.setRecentlyLogged(userId);
      console.log("Recently logged status updated for userID:", userId);
    } catch (error) {
      console.error("Error updating recently logged status:", error);
    }
  }
  trackButtonClick1(): void {
    console.log("success", "hey");
    gtag('event', 'rewardButton', {
      event_category: 'Button05',
      event_label: 'RewardButton'
    });}
}
