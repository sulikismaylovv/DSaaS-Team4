import { Component } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-daily-award',
  templateUrl: './daily-award.component.html',
  styleUrls: ['./daily-award.component.css']
})
export class DailyAwardComponent {
  constructor(public dialogRef: MatDialogRef<DailyAwardComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

}
