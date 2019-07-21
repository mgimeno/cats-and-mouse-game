import { Component } from '@angular/core';
import { SignalrService } from './shared/services/signalr-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private signalrService: SignalrService) {

    this.signalrService.startConnection();
  }

  get connectionStatus(): signalR.HubConnectionState {
    return this.signalrService.connectionStatus;
  }

}
