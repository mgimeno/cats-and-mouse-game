import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection;

  private restartIntervalsIds: number[] = [];

  constructor() {
  }

  startConnection = (): void => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiGameHubUrl)
      .configureLogging(signalR.LogLevel.Information)
      //.withHubProtocol()
      .build();

    this.hubConnection.onclose((error: Error) => {
      console.error("on close connection", error);
      this.restart();
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

  private start = (): void => {

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.restartIntervalsIds.forEach(i => clearInterval(i));
      return;
    }
    else {
      this.hubConnection.start()
        .then(() => {
          this.restartIntervalsIds.forEach(i => clearInterval(i));
        })
        .catch(err => {
          this.restart();
        });
    }
  };

  private restart = (): void => {

    const restartIntervalId = window.setInterval(() => {

      console.log("interval run");

      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        this.restartIntervalsIds.forEach(i => clearInterval(i));
      }
      else {
        console.log("Reconnecting...");
        this.start();
      }

    }, 5000);

    this.restartIntervalsIds.push(restartIntervalId);

  };

  get connectionStatus(): signalR.HubConnectionState {
    return this.hubConnection.state;
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


