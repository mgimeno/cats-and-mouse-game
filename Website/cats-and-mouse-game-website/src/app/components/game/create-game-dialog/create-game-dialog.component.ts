import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ILabelValue } from 'src/app/shared/interfaces/label-value.interface';
import { MatDialogRef } from '@angular/material/dialog';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { environment } from 'src/environments/environment';
import { SignalrService } from '../../../shared/services/signalr-service';
import { IGameListItem } from '../../../shared/interfaces/game-list-item.interface';
import { Router } from '@angular/router';
import { IGameStartMessage } from '../../../shared/interfaces/game-start-message.interface';
import { NotificationService } from 'src/app/shared/services/notification.service';


@Component({
  templateUrl: './create-game-dialog.component.html',
  styleUrls: ['./create-game-dialog.component.scss']
})
export class CreateGameDialogComponent implements OnInit, OnDestroy {

  formGroup: FormGroup = null;
  isGameCreated: boolean = false;
  joinGameUrl: string = null;
  isJoinGameLinkCopiedToClipboard: boolean = false;
  createdGame: IGameListItem = null;

  //todo refactor (come from constants)
  teams: ILabelValue[] = [{ label: TeamEnum[TeamEnum.Cats], value: TeamEnum.Cats }, { label: TeamEnum[TeamEnum.Mouse], value: TeamEnum.Mouse }];

  constructor(
    public dialogRef: MatDialogRef<CreateGameDialogComponent>,
    private signalrService: SignalrService,
    private router: Router,
    private notificationService: NotificationService) { }

  ngOnInit() {

    const previousUserName = localStorage.getItem(`${environment.localStoragePrefix}user-name`);

    this.formGroup = new FormGroup({
      'userName': new FormControl(previousUserName || null, Validators.required),
      'teamId': new FormControl(null, Validators.required),
      'gamePassword': new FormControl(null)
    });
  }

  isSubmitButtonDisabled(): boolean {
    return this.formGroup.invalid;
  }

  onSubmit(): void {

    const userName = this.formGroup.controls.userName.value;

    const message = {
      userName: userName,
      teamId: this.formGroup.controls.teamId.value,
      gamePassword: this.formGroup.controls.gamePassword.value
    };

    localStorage.setItem(`${environment.localStoragePrefix}user-name`, userName);

    this.signalrService.sendMessage("CreateGame", message)
      .then((game: IGameListItem) => {

        this.isGameCreated = true;

        this.createdGame = game;

        this.joinGameUrl = `${environment.websiteUrl}?joinGame=${game.gameId}`;

      })
      .catch((reason: any) => {
        this.notificationService.showError("Error when creating the game");
        console.error(reason);
      });

    this.signalrService.subscribeToMethod("GameStart", (message: IGameStartMessage) => {

      console.log("AppComponent message", message);

      console.log("game start");

      this.router.navigate(['/play']);

      this.dialogRef.close();

    });

  }

  onCopyLinkClick(): void {
    this.isJoinGameLinkCopiedToClipboard = true;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCancelGame(): void {

    const cancelGameModel = {
      gameId: this.createdGame.gameId,
      userId: localStorage.getItem(`${environment.localStoragePrefix}user-id`)
    };

    this.signalrService.sendMessage("CancelGameThatHasNotStarted", cancelGameModel)
      .catch((reason: any) => {
        this.notificationService.showError("Error when canceling the game");
        console.error(reason);
      });

    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    console.log("Destroy create game");
    this.signalrService.unsubscribeToMethod("GameStart");
  }
}
