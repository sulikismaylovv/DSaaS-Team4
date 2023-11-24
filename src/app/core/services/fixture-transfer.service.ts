import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fixture } from '../models/fixtures.model';

@Injectable({
  providedIn: 'root'
})
export class FixtureTransferService {
  private fixtureSource = new BehaviorSubject<Fixture | null>(null);
  currentFixture = this.fixtureSource.asObservable();

  constructor() { }

  changeFixture(fixture: Fixture) {
    this.fixtureSource.next(fixture);
  }
}