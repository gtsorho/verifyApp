import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoaderService } from '../loader.service';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {


  constructor(private loaderService: LoaderService) { }
  private baseUrl = this.loaderService.baseUrl()

  getCertificates(): Observable<any> {
    const token = this.getCookie('token');
    const url = `${this.baseUrl}/certificate`;
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
  
  searchCertificates(searchVal:string): Observable<any> {
    const url = `${this.baseUrl}/certificate/search?search=${searchVal}`;
    return new Observable((observer) => {
      axios
        .get(url)
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
