import { Injectable } from '@angular/core';
import {DailyAwardComponent} from "../../modules/homepage_module/daily-award/daily-award.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class DailyAwardService {
  private lastShownDate: string | null = null;

  constructor(private dialog: MatDialog) {}

  shouldShowPopup(): boolean {
    const currentDate = new Date().toLocaleDateString();
    if (this.lastShownDate !== currentDate) {
      this.lastShownDate = currentDate;
      return true;
    }
    return false;
  }
  openPopup(): void {
    if (this.shouldShowPopup()) {
      const dialogRef = this.dialog.open(DailyAwardComponent, {
        width: '400px', // Adjust the width as needed
        disableClose: true,
      });

      // Optionally, you can handle dialog closed event
      dialogRef.afterClosed().subscribe(() => {
        console.log('Dialog closed');
      });
    }
  }


}
