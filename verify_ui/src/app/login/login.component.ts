import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';
import { LoaderService } from '../main/loader.service';
import { IndividualService } from '../main/individual/individual.service';
import { CertificateComponent } from './certificate/certificate.component';
import { CertificatesComponent } from './certificates/certificates.component';

interface credentials {
  username: string;
  password: string;
}
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CertificateComponent, CertificatesComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private router: Router, public loaderService: LoaderService, private individualService: IndividualService) { }
  private baseUrl = this.loaderService.baseUrl()
  token: string = ''
  verify: boolean = false
  findAllCert: boolean = false;
  credentials: credentials = {
    username: '',
    password: ''
  };
  ghana_cardNo: string = ''
  certificateVal: string = ''
  certificate: any
  certificates: any = []

  login() {
    axios.post(this.baseUrl + '/users/login', this.credentials)
      .then((response) => {
        console.log(response.data)
        this.setCookie('token', response.data.token, 1);
        this.router.navigate(['/main/institution']);
      })
      .catch(error => {
        console.log(error);
      });
  }

  verifyCertificate() {
    this.individualService.verifyCert(this.ghana_cardNo, this.certificateVal).subscribe((res) => {
      this.certificate = res.data
      this.certificates = []
      console.log(this.certificate)
    })
  }
  relatedCertificates() {
    this.individualService.getRelatedCerts(this.ghana_cardNo).subscribe((res) => {
      this.certificates = res
      this.certificate = null
    })
  }

  setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  }
}