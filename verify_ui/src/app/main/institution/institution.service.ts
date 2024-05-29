import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoaderService } from '../loader.service';

@Injectable({
  providedIn: 'root'
})
export class InstitutionService {

  private token: string = this.getCookie('token');
  constructor(private loaderService: LoaderService) { }
  private baseUrl = this.loaderService.baseUrl()

  getInstitutions(): Observable<any> {
    const url = `${this.baseUrl}/institutions`;
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

  getInstitutionById(id:number): Observable<any> {
    const url = `${this.baseUrl}/institutions/${id}`;
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
