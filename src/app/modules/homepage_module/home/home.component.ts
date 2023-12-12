import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NavbarService} from "../../../core/services/navbar.service";
import {SupabaseFixture, SupabaseFixtureModel} from "../../../core/models/supabase-fixtures.model";
import {Club} from "../../../core/models/club.model";
import {DailyAwardService} from "../../../core/services/daily-award.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  league: Club[] = [];
  showPosts = false;
  showMatches = true;
  activeContent = 'matches';

  constructor(
    public navbarService: NavbarService,
    private router: Router,
    private dailyAwardService: DailyAwardService

  ) {
  }
  ngOnInit() {
    this.dailyAwardService.openPopup();
    this.navbarService.setShowNavbar(true);

  }

  showPostsContent() {
    this.activeContent= 'posts';
    this.showPosts = true;
    this.showMatches = false;
  }

  showMatchesContent() {
    this.activeContent= 'matches';
    this.showPosts = false;
    this.showMatches = true;
  }



}
