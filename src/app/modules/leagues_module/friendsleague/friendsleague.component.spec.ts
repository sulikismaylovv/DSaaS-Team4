import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsleagueComponent } from './friendsleague.component';

describe('FriendsleagueComponent', () => {
  let component: FriendsleagueComponent;
  let fixture: ComponentFixture<FriendsleagueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FriendsleagueComponent]
    });
    fixture = TestBed.createComponent(FriendsleagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
