import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoaderService } from '../loader.service';

@Injectable({
  providedIn: 'root'
})
export class IndividualService {

  constructor(private loaderService: LoaderService) { }
  private baseUrl = this.loaderService.baseUrl()

  getIndividuals(): Observable<any> {
    const token = this.getCookie('token');
    if (!token) {
      return new Observable((observer) => {
        observer.error('token is not provided');
        observer.complete();
      });
    }

    const url = `${this.baseUrl}/individual`;
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
  searchIndividuals(searchVal:string): Observable<any> {
    const token = this.getCookie('token');
    if (!token) {
      return new Observable((observer) => {
        observer.error('token is not provided');
        observer.complete();
      });
    }

    const url = `${this.baseUrl}/individual/search?searchVal=${searchVal}`;
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

  verifyCert(ghana_cardNo: string, certificateNo: string): Observable<any> {
    const url = `${this.baseUrl}/individual/verify?ghana_cardNo=${ghana_cardNo}&certificate=${certificateNo}`;
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


  getRelatedCerts(ghana_cardNo: string): Observable<any> {
    const url = `${this.baseUrl}/individual/related?ghana_cardNo=${ghana_cardNo}`;
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
