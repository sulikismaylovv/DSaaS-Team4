import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PostViewComponent} from './post-view.component';

describe('PostViewComponent', () => {
    let component: PostViewComponent;
    let fixture: ComponentFixture<PostViewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PostViewComponent]
        });
        fixture = TestBed.createComponent(PostViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
