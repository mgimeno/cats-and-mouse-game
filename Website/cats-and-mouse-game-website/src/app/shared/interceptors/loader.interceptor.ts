import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

    constructor(
        private loaderService: LoaderService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        
        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {

            if(event.type === HttpEventType.Sent){
                this.loaderService.showLoader();
            }
            
            if(event.type === HttpEventType.Response){
                this.loaderService.hideLoader();
            }
            
            return event;

            
        }))
    }
}