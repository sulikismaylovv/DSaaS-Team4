import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fixture } from '../models/fixtures.model';
import { SupabaseFixture } from '../models/supabase-fixtures.model';

@Injectable({
  providedIn: 'root'
})
export class FixtureTransferService {
  private fixtureSource = new BehaviorSubject<SupabaseFixture | null>(null);
  currentFixture = this.fixtureSource.asObservable();

  constructor() { }

  changeFixture(fixture: SupabaseFixture) {
    this.fixtureSource.next(fixture);
  }
}