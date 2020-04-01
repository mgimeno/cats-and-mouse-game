import { Component } from '@angular/core';
import { SignalrService } from './shared/services/signalr-service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReconnectingDialogComponent } from './components/reconnecting-dialog/reconnecting-dialog.component';
import { environment } from 'src/environments/environment';
import { CommonHelper } from './shared/helpers/common-helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isReconnectingDialogOpen: boolean = false;
  reconnectingDialogRef: MatDialogRef<ReconnectingDialogComponent> = null;

  constructor(
    private signalrService: SignalrService,
    private dialog: MatDialog) {

    this.createBrowserUserId();

    this.openReconnectingDialog();
    this.signalrService.startConnection();

    setInterval(() => {
      if (!this.isReconnectingDialogOpen && !this.signalrService.isConnected) {
        this.openReconnectingDialog();
      }
      else if (this.isReconnectingDialogOpen && this.signalrService.isConnected && this.reconnectingDialogRef) {
        this.reconnectingDialogRef.close();
        this.isReconnectingDialogOpen = false;
      }
    }, 100);

  }

  private openReconnectingDialog(): void {
    this.isReconnectingDialogOpen = true;
    this.reconnectingDialogRef = this.dialog.open(ReconnectingDialogComponent, { height: "100%", width: "100%" });
  }

  private createBrowserUserId(): void{
    const userId = localStorage.getItem(`${environment.localStoragePrefix}user-id`);
    if(!userId){
      localStorage.setItem(`${environment.localStoragePrefix}user-id`,CommonHelper.getNewGuid());
    }
  }

}
