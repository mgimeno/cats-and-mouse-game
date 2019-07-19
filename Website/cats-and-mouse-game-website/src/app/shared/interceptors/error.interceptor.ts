import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        private notificationService: NotificationService,
        private loaderService: LoaderService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(catchError(err => {

            this.loaderService.hideLoader();

            console.error(err);

            switch(err.status){

                case 0:
                    this.notificationService.showError("API is not responding");
                break;

                case 401:
                    this.notificationService.showError("Unauthorised");

                    //logout
                    location.reload(true);
                break;

                default:
                    this.notificationService.showError("An error ocurred");
            }

            if(err.error && err.error.message){
                return throwError(err.error.message);
            }
            else{
                return throwError(err.statusText);    
            }
        }))
    }
}