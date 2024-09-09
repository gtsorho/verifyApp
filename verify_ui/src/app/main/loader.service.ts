import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  baseUrl() {
    return 'http://localhost:3000/api';
    // return 'https://verify.miphost.com/api';

  }
  constructor(private loginService: LoginService,
  ) { }
  

  getUserById(): Observable<any> {
    const id = this.loginService.getTokenData('id');
    if (!id) {
      return new Observable((observer) => {
        observer.error('User ID is not provided');
        observer.complete();
      });
    }
  
    const url = `${this.baseUrl()}/users/${id}`;
    const token = this.getCookie('token');
    return new Observable((observer) => {
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
  

  
  getData(): Observable<any> {
    const url = `${this.baseUrl()}/institutions/home`;
    return new Observable((observer) => {
      axios.get(url)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
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
