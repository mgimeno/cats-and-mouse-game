import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import { environment } from '../../../environments/environment';

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
      .configureLogging(signalR.LogLevel.Information)
      //.withHubProtocol()
      .withAutomaticReconnect([0,1,2,3,4,5,6,7,8,9,10]) // todo make it infinity
      .build();

    this.hubConnection.onclose((error: Error) => {
      console.error("on close connection", error);
    })

    this.start();
  }

  subscribeToMethod = (methodName: string, callback: any) => {
    this.hubConnection.on(methodName, data => {
      callback(data);
    });
  };

  unsubscribeToMethod = (methodName: string) => {
    this.hubConnection.off(methodName);
  };

  get isConnected(): boolean {
    return this.hubConnection.state === signalR.HubConnectionState.Connected;
  }

  private start(): void  {

    if (!this.isConnected) {
      this.hubConnection.start()
        .catch(async err => {
          await new Promise(r => setTimeout(r, 100));
          this.start();
        });
    }
  } 

  async sendMessage(method: string, parameters: any = null): Promise<any> {

    while (!this.isConnected) {
      await new Promise(r => setTimeout(r, 100));
    }

    if (parameters) {
      return this.hubConnection.invoke(method, parameters);
    }
    else {
      return this.hubConnection.invoke(method);
    }

  }

}


