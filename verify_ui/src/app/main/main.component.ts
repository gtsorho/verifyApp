import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet, RouterLink, ActivatedRoute } from '@angular/router';
import { InstitutionComponent } from './institution/institution.component';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { IndividualComponent } from './individual/individual.component';
import { LoginService } from '../login/login.service';
import { LoaderService } from './loader.service';
 
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, InstitutionComponent, IndividualComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
        })
      ),
      state(
        'closed',
        style({
          height: '0',
          opacity: 0,
        })
      ),
      transition('open <=> closed', [animate('0.3s ease-in-out')]),
    ]),
  ],
})
export class MainComponent {

  constructor(
    private loginService: LoginService,
    private loaderService: LoaderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  jwtToken: string = '';
  isTokenExpired: boolean | undefined;
  toggleSideNav: boolean = true;
  activeTab: string | null = null;
  activeSection: string | null = 'dashboard';
  isOpen = false;
  user:any

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    if (window.innerWidth < 800){
      this.toggleSideNav = false;
    }else{
      this.toggleSideNav = true;
    }
     
  }

  ngOnInit() {
    this.checkTokenExpiration();
    const childRoute = this.route.snapshot.firstChild?.routeConfig?.path;
    this.activeSection = childRoute || 'dashboard';
    this.loaderService.getUserById().subscribe((data) => {
      this.user = data
    })
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }
  checkTokenExpiration() {
    if (this.loginService.isTokenExpired()) {
      console.log('Token is expired. Redirect or perform other actions.');
      this.router.navigate(['']);
    } else {
      console.log('Token is not expired. Continue with normal flow.');
    }
  }
  setIntervalCheckToken() {
    setInterval(() => {
      this.checkTokenExpiration();
    }, 1200000);
  }
  clearToken() {
    this.setCookie('token', '', 1);
    this.router.navigate(['']);
    }

  getCookie(cname: string) {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }
  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
}