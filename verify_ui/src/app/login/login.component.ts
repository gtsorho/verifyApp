import { CommonModule } from '@angular/common';
import { Component, HostListener  } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';
import { LoaderService } from '../main/loader.service';
import { IndividualService } from '../main/individual/individual.service';
import { CertificateComponent } from './certificate/certificate.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { CountersComponent } from "./counters/counters.component";
import { CertificateService } from '../main/certificate/certificate.service';

interface credentials {
  username: string;
  password: string;
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CertificateComponent, CertificatesComponent, CountersComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  searchCertificates: any
  isSearchLoader: boolean = false;

  constructor(private router: Router, public loaderService: LoaderService, private individualService: IndividualService, private certificateService:CertificateService) { }
  private baseUrl = this.loaderService.baseUrl()
  token: string = ''
  verify: boolean = true
  findAllCert: boolean = false;
  credentials: credentials = {
    username: '',
    password: ''
  };
  ghana_cardNo: string = ''
  certificateVal: string = ''
  certificate: any
  certificates: any = []
  isLoader: boolean = false
  msg: any;
  isMsg: any = false
  isDropdownOpen = false;
  searchValue:string = ''


  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  login() {
    this.isLoader = true
    axios.post(this.baseUrl + '/users/login', this.credentials)
      .then((response) => {
        this.setCookie('token', response.data.token, 1);
        this.router.navigate(['/main/institution']);
        this.isLoader = false
      })
      .catch(error => {
        console.log(error);
        this.isLoader = false
        this.isMsg = true
        this.msg = error.response.data.message
        setInterval(() => {
          this.isMsg = false
        }, 3000);
      });
  }

  verifyCertificate() {
    this.individualService.verifyCert(this.ghana_cardNo, this.certificateVal).subscribe((res) => {
      this.certificate = res.data
      this.certificates = []
    })
  }
  relatedCertificates() {
    this.individualService.getRelatedCerts(this.ghana_cardNo).subscribe((res) => {
      this.certificates = res
      this.certificate = null
    })
  }

searchCertificate(){
  this.isSearchLoader = true
  this.certificateService.searchCertificates(this.searchValue).subscribe((res) => {
    this.searchCertificates = res
    this.isSearchLoader = false
  })
}

  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownButton = document.getElementById('dropdown-button');
    const dropdownMenu = document.getElementById('dropdown-menu');

    if (dropdownButton && dropdownMenu && !dropdownButton.contains(target) && !dropdownMenu.contains(target)) {
      this.isDropdownOpen = false;
    }
  }

}