import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { environment } from '../../../environments/environment';
import { logging } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection;

  constructor() {
  }

  startConnection = (): void => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiGameHubUrl)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));

    //todo use this
    //this.hubConnection.onclose()

    this.hubConnection.on("messageToClient", data => {
      console.log("message from api", data);
    });
  }

  sendMessage = (method: string, parameters: any = null): Promise<any> => {

    if (parameters) {
      return this.hubConnection.invoke(method, parameters);
    }
    else {
      return this.hubConnection.invoke(method);
    }

    
  }

  

}


