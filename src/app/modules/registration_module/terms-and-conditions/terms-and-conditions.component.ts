import { Component } from '@angular/core';
import {AuthService} from "../../../core/services/auth.service";
import {Router} from "@angular/router";
import {NavbarService} from "../../../core/services/navbar.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.css']
})
export class TermsAndConditionsComponent {
  constructor(
    protected dialog: MatDialog
  ){}
  closeTCModal(): void{
    const dialogReg =this.dialog.closeAll()
  }
}
