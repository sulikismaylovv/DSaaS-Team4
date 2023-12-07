import {ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation,} from '@angular/core';

@Component({
    selector: 'app-stepper',
    templateUrl: './stepper.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent implements OnInit {
    @Input()
        // currentStep!: number;
        // steps: number[] = [1, 2, 3, 4]; // Adjust the array based on the number of steps
    currentStep = 1; // Starts at step 1


    steps = [1, 2, 3, 4];

    ngOnInit(): void {
    }

    getStepDescription(stepNumber: number): string {
        switch (stepNumber) {
            case 1:
                return "YOUR INFO";
            case 2:
                return "CHOOSE FAVOURITE CLUB";
            case 3:
                return "CHOOSE CLUBS YOU WANT TO FOLLOW";
            case 4:
                return "SUMMARY";
            default:
                return "";
        }
    }

}
