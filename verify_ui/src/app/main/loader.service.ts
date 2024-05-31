import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  baseUrl() {
    // return 'http://localhost:3000/api';
    return 'https://verify.miphost.com/api';

  }
  constructor(private loginService: LoginService,
  ) { }
  private token: string = this.getCookie('token');
  private id = this.loginService.getTokenData('id');

  getUserById(): Observable<any> {
    const url = `${this.baseUrl()}/users/${this.id}`;
    return new Observable((observer) => {
      axios
        .get(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
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
