import { Component } from '@angular/core';
import { SignalrService } from './shared/services/signalr-service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReconnectingDialogComponent } from './components/reconnecting-dialog/reconnecting-dialog.component';
import { environment } from 'src/environments/environment';
import { CommonHelper } from './shared/helpers/common-helper';
import { Router } from '@angular/router';
import { IPlayerHasInProgressGameMessage } from './shared/interfaces/player-has-in-progress-game-message';
import { Meta, Title, MetaDefinition } from '@angular/platform-browser';

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
    private dialog: MatDialog,
    private router: Router,
    private meta: Meta,
    private title: Title) {

    this.addTitleAndMetaTags();

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

    this.signalrService.subscribeToMethod("HasInProgressGame", (message: IPlayerHasInProgressGameMessage) => {

      if (message.hasInProgressGame) {
        this.router.navigate(['/play']);
      }
      else {
        this.router.navigate(['/']);
      }

    });

  }

  private openReconnectingDialog(): void {
    this.isReconnectingDialogOpen = true;
    this.reconnectingDialogRef = this.dialog.open(ReconnectingDialogComponent, { height: "100%", width: "100%" });
  }

  private createBrowserUserId(): void {
    const userId = localStorage.getItem(`${environment.localStoragePrefix}user-id`);
    if (!userId) {
      localStorage.setItem(`${environment.localStoragePrefix}user-id`, CommonHelper.getNewGuid());
    }
  }

  private addTitleAndMetaTags(): void {

    this.title.setTitle($localize`:@@index.title:Cats & Mouse Game`);
    this.meta.addTags([
      <MetaDefinition>{ name: "description", content: $localize`:@@index.meta_description:Play for free and online to Cats and mouse game on a chessboard` },
      <MetaDefinition>{ property: "og:title", content: $localize`:@@index.title:Play for free Cats and mouse with friends` },
      <MetaDefinition>{ property: "og:description", content: $localize`:@@index.meta_og_description:Play for free Cats and mouse with friends` },
      //todo <MetaDefinition>{property: "og:url", content:""},
      //todo <MetaDefinition>{property: "og:image", content: ""},
      <MetaDefinition>{ property: "og:type", content: "website" },
      <MetaDefinition>{property: "fb:admins", content: "1114899665"},
    ], true);

    const languageCode = localStorage.getItem(`${environment.localStoragePrefix}language`);
    this.meta.addTag(<MetaDefinition>{ property: "og:locale", content: (languageCode === "en" ? "en_GB" : "es_ES") }, true);
    this.meta.addTag(<MetaDefinition>{ property: "og:locale:alternate", content: (languageCode === "en" ? "es_ES" : "en_GB") }, true);
  }
}
