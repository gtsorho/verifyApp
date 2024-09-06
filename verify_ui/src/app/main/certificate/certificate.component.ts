import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CertificateService } from './certificate.service';
import { LoaderService } from '../loader.service';
import { InstitutionService } from '../institution/institution.service';
import { FormsModule } from '@angular/forms';
import axios from 'axios';
import { LoginService } from '../../login/login.service';

interface Certificate {
  id?: string;
  Institution?: any;
  InstitutionId?: number;
  certificate: string;
  prefix: string
  count: number;
  category: string;
  description: string;
}

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate.component.html',
  styleUrl: './certificate.component.scss'
})
export class CertificateComponent {
  institutions: any;
  isLoader: boolean = false
  isMsg: boolean = false
  msg: any;
  constructor(private certificateService: CertificateService, private loginService: LoginService, private institutionService: InstitutionService, private loaderService: LoaderService) { }

  token: string = ''
  baseUrl: string = this.loaderService.baseUrl()
  certificate: Certificate = {
    InstitutionId: 0,
    certificate: '',
    prefix: '',
    count: 0,
    category: '',
    description: ''
  }
  certificates: Certificate[] = [];
  isAdmin: boolean = true

  ngOnInit(): void {
    this.token = this.getCookie('token')
    this.getCertificates()
    const data = this.loginService.getDecodedToken();
    if (data.role == 'organization') {
      this.isAdmin = false;
      this.certificate.InstitutionId = data.InstitutionID
      this.getInstitutionById()
    } else {
      this.getInstitutions()
    }
  }


  createCertificate() {
    this.isLoader = true
    axios.post(this.baseUrl + '/certificate', this.certificate,
      { 'headers': { 'authorization': 'Bearer ' + this.token } }
    ).then((response) => {
      this.getCertificates()
      this.isLoader = false
    }).catch((error) => {
      console.log(error);
      this.isMsg = true
      this.msg = error.response.data.message
      setInterval(() => {
        this.isMsg = false
      }, 3000);
    })
  }

  getCertificates() {
    this.certificateService.getCertificates().subscribe((data) => {
      this.certificates = data
    })
  }
  getInstitutions() {
    this.institutionService.getInstitutions().subscribe((data) => {
      this.institutions = data[0]
    })
  }
  getInstitutionById(): void {
    if (this.certificate.InstitutionId) {
      this.institutionService.getInstitutionById(this.certificate.InstitutionId).subscribe((data) => {
        this.institutions = data[0];
      });
    }
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
}
