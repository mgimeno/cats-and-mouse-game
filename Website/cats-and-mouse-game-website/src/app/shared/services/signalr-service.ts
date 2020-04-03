import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr";
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection;

  constructor(
    private notificationService: NotificationService,
    private router: Router) {
  }

  startConnection = (): void => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiGameHubUrl)
      .configureLogging(signalR.LogLevel.Information)
      //.withHubProtocol()
      .withAutomaticReconnect(this.getRetryDelaysArray())
      .build();

    this.hubConnection.serverTimeoutInMilliseconds = 15 * 60 * 1000;

    this.hubConnection.onclose((error: Error) => {
      console.error("on close connection", error);
    });

    this.hubConnection.onreconnected(() => {
      this.registerConnection();
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

  private registerConnection(): void {

    this.sendMessage("RegisterConnection", localStorage[`${environment.localStoragePrefix}user-id`])
    .then(() => {
      
      if (this.router.url === "/play") {
        this.sendMessage("SendInProgressGameStatusToCaller")
          .catch((reason: any) => {
            console.error(reason);
            this.notificationService.showError("Game does not exist");
            this.router.navigate(['/']);
          });
      }

    });
  }

  private start(): void {

    if (!this.isConnected) {
      this.hubConnection.start()
        .then(() => {
          this.registerConnection();
        })
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

  private getRetryDelaysArray(): number[] {

    let result = [];
    const oneHourInSeconds = 3600;
    for (let sec = 0; sec <= oneHourInSeconds; sec++) {
      result.push(sec * 1000);
    }

    return result;
  }

}


