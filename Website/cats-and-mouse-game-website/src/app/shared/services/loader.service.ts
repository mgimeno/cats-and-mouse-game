import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private isLoadingSubject: BehaviorSubject<boolean>;
  public isLoading$: Observable<boolean>;

  constructor() {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }

  public get isLoadingValue(): boolean {
    return this.isLoadingSubject.value;
  }

  showLoader(): void{
    this.isLoadingSubject.next(true);
  }

  hideLoader(): void{
    this.isLoadingSubject.next(false);
  }

}