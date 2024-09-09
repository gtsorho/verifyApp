import { Component } from '@angular/core';
import axios from 'axios';
import { LoaderService } from '../loader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstitutionService } from '../institution/institution.service';

interface user {
  username: string,
  phone: string,
  password:string,
  InstitutionId:string,
  Institution?:any,
  confirmPassword:string,
  role:string,
  id?:string
}

interface institution {
  name: string,
  description: string,
  location:string,
  accreditation:string,
  id?:string
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})


export class SettingsComponent {

  isUpdate: boolean = false;
  isUpdateUser : boolean = false;
  isLoader: boolean = false
  baseUrl: string = this.loaderService.baseUrl()
  token: string = ''
  users: user[] = [];
  user: user = {
    username: '',
    phone: '',
    InstitutionId:'default',
    password:'',
    confirmPassword:'',
    role:'organization',
  }
  isMsg: boolean = false
  msg: any;
  institutions: institution [] = [];
  institution:institution = {
    name: '',
    description: '',
    location:'',
    accreditation:'',
  };
  toggleUserSettings: boolean = false
  toggleInstitutionsSettings: boolean = false

  
  constructor(private loaderService:LoaderService, private institutionService:InstitutionService){}

  ngOnInit(): void {
    this.token = this.getCookie('token')
    this.getUsers()
    this.getInstitutions()
  }

  createUser() {
    this.isLoader = true
    axios.post(this.baseUrl + '/users', this.user,
      { 'headers': { 'authorization': 'Bearer ' + this.token } }
    ).then((response) => {
      this.getUsers()
      this.user = {
        username: '',
        phone: '',
        InstitutionId:'default',
        password:'',
        confirmPassword:'',
        role:'organization'
      }
      this.isLoader = false
    }).catch((error) => {
      console.log(error);
      this.isMsg = true
      this.msg = error.response.data.message || error.response.data
      setInterval(() => {
        this.isMsg = false
        this.isLoader = false
      }, 3000);
    })
  }

  createInstitution() {
    this.isLoader = true
    axios.post(this.baseUrl + '/institutions', this.institution,
      { 'headers': { 'authorization': 'Bearer ' + this.token } }
    ).then((response) => {
      this.getInstitutions()
      this.institution = {
        name: '',
        description: '',
        location:'',
        accreditation:'',
      }
      this.isLoader = false
    }).catch((error) => {
      console.log(error);
      this.isMsg = true
      this.msg = error.response.data.message || error.response.data
      setInterval(() => {
        this.isMsg = false
        this.isLoader = false
      }, 3000);
    })
  }


  updateUser() {
    this.isLoader = true
    axios.put(this.baseUrl + '/users/update/'+this.user.id, this.user,
      { 'headers': { 'authorization': 'Bearer ' + this.token }}
    ).then((response) => {
      this.getUsers()
      this.user = {
        username: '',
        phone: '',
        InstitutionId:'default',
        password:'',
        confirmPassword:'',
        role:'organization'
      }
      this.isLoader = false
    }).catch((error) => {
      console.log(error);
      this.isMsg = true
      this.msg = error.response.data.message || error.response.data
      setInterval(() => {
        this.isMsg = false
        this.isLoader = false
      }, 3000);
    })  
  }

  updateInstitution() {
    this.isLoader = true
    axios.put(this.baseUrl + '/institutions/'+ this.institution.id, this.institution,
      { 'headers': { 'authorization': 'Bearer ' + this.token }}
    ).then((response) => {
      this.getInstitutions()
      this.institution = {
        name: '',
        description: '',
        location:'',
        accreditation:'',
      }
      this.isLoader = false
    }).catch((error) => {
      console.log(error);
      this.isMsg = true
      this.msg = error.response.data.message || error.response.data
      setInterval(() => {
        this.isMsg = false
        this.isLoader = false
      }, 3000);
    })
  }

  getUsers() {
    axios.get(`${this.baseUrl}/users`,
      {
        headers:{
          Authorization: `Bearer ${this.token}`,
        }
      })
      .then((response) => {
        this.users = response.data
      })
      .catch((error) => {
        console.log(error)
      });
  }

  getInstitutions(){
    this.institutionService.getInstitutions().subscribe((data)=>{
      this.institutions = data[0]
    })
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
  
  scrollToSection(sectionId: string) {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      console.log(element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200); 
  }
}
