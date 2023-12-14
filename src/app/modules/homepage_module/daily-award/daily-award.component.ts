import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../../../core/services/auth.service";
declare let gtag: Function;
@Component({
  selector: "app-daily-award",
  templateUrl: "./daily-award.component.html",
  styleUrls: ["./daily-award.component.css"],
})
export class DailyAwardComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<DailyAwardComponent>,
    private authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {
  }

  close(): void {
    this.dialogRef.close();
    this.trackButtonClick1();
  }

  trackButtonClick1(): void {
    console.log("success", "hey");
    gtag('event', 'rewardButton', {
      event_category: 'Button05',
      event_label: 'RewardButton'
    });}
}
