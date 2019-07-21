import { Injectable } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection;

  private restartIntervalId: number = null;

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

  private start = () => {

    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      //Already connected.
      if (this.restartIntervalId) {
        clearInterval(this.restartIntervalId);
        this.restartIntervalId = null;
      }
      return;
    }

    this.hubConnection.start()
      .then(() => {
        this.restartIntervalId = null;
      })
      .catch(err => {
        this.restart();
      });
  };

  private restart = () => {
    this.restartIntervalId = window.setInterval(() => {

      console.log(this.hubConnection.state);
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
        //Already connected.
        if (this.restartIntervalId) {
          clearInterval(this.restartIntervalId);
          this.restartIntervalId = null;
          
        }
      }
      else {
        console.log("Reconnecting...");
        this.start();
      }


    }, 5000)
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


