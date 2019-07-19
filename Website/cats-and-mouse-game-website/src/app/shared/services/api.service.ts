import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  call(method: string, url: string, payload: any = null, params: any = null): Observable<any> {

    let headers: any = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }

    let httpOptions: any = {
      params: params,
      headers: headers,
      body: payload
    };

    return this.http.request(method, url, httpOptions);

  }
}