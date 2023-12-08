import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamComponent } from './team.component';

describe('TeamComponent', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamComponent]
    });
    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
    // Example team data for testing
    component.team = { id: 1, name: 'Team A' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selectTeam event on toggleSelection', () => {
    spyOn(component.selectTeam, 'emit');
    component.toggleSelection();
    expect(component.selectTeam.emit).toHaveBeenCalledWith(component.team);
  });

  it('should not emit selectTeam event if favorite is true', () => {
    component.favorite = true;
    spyOn(component.selectTeam, 'emit');
    component.toggleSelection();
    expect(component.selectTeam.emit).not.toHaveBeenCalled();
  });
});
