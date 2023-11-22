import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../core/services/auth.service";
import {Session} from "@supabase/supabase-js";

@Component({
  selector: 'app-globalleague',
  templateUrl: './globalleague.component.html',
  styleUrls: ['./globalleague.component.css']
})
export class GloballeagueComponent implements OnInit {
  currentView: 'global' | 'friends' = 'global';
  private session: Session | null | undefined;

  constructor(
    private readonly authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.authService.authChanges((_, session) => (this.session = session));
    console.log(this.session);
  }

}
