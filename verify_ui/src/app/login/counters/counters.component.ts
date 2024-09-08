import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { LoaderService } from '../../main/loader.service';

@Component({
  selector: 'app-counters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counters.component.html',
  styleUrl: './counters.component.scss'
})
export class CountersComponent {
  constructor(private loaderService:LoaderService) {}


  count1 = 0;
  count2 = 0;
  count3 = 0;
  count4 = 0;


  targetCount1 = 40;
  targetCount2 = 70;
  targetCount3 = 149;
  targetCount4 = 23;


  // Use ViewChild to get references to the elements
  @ViewChild('counter1') counter1!: ElementRef;
  @ViewChild('counter2') counter2!: ElementRef;
  @ViewChild('counter3') counter3!: ElementRef;
  @ViewChild('counter4') counter4!: ElementRef;


  ngAfterViewInit() {
    this.getData()
  }

  setupObserver(element: ElementRef, callback: () => void) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target); // Stop observing once it’s shown
        }
      });
    });

    observer.observe(element.nativeElement);
  }

  animateCount(countProperty: 'count1' | 'count2' | 'count3'| 'count4', target: number) {
    let currentCount = 0;
    const interval = setInterval(() => {
      currentCount += 1;
      this[countProperty] = currentCount;
      if (currentCount >= target) {
        clearInterval(interval);
      }
    }, 50); // Adjust the interval time to control speed
  }

  getData(): void {
    this.loaderService.getData().subscribe((data) => {
      console.log(data)
      this.targetCount1 = data.institutions;
      this.targetCount2 = data.individuals;
      this.targetCount3 = data.certificates;
      this.targetCount4 = data.issued;


      this.setupObserver(this.counter1, () => this.animateCount('count1', this.targetCount1));
      this.setupObserver(this.counter2, () => this.animateCount('count2', this.targetCount2));
      this.setupObserver(this.counter3, () => this.animateCount('count3', this.targetCount3));
      this.setupObserver(this.counter4, () => this.animateCount('count4', this.targetCount4));

    });
  }
}
