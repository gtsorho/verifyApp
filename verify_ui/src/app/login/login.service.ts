import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { jwtDecode } from "jwt-decode";


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor() { }

  // Method to get the token from cookies
  getCookie(cname: string): string {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  // Method to decode the token
  getDecodedToken(): any {
    const token = this.getCookie('token');
    if (token) {
      try {
        return   jwtDecode(token);
      } catch (Error) {
        return null;
      }
    }
    return null;
  }

  // Method to get specific data from the token
  getTokenData(key: string): any {
    const decodedToken = this.getDecodedToken();
    if (decodedToken) {
      return decodedToken[key];
    }
    return null;
  }

  // Method to check if the token is expired
  isTokenExpired(): boolean {
    const token = this.getCookie('token');
    return token ? this.jwtHelper.isTokenExpired(token) : true;
  }
}
