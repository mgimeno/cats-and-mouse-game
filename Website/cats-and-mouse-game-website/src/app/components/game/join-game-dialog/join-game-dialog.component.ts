import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ILabelValue } from 'src/app/shared/interfaces/label-value.interface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IGameListItem } from 'src/app/shared/interfaces/game-list-item.interface';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { SignalrService } from '../../../shared/services/signalr-service';
import { Router } from '@angular/router';
import { IGameStartMessage } from '../../../shared/interfaces/game-start-message.interface';
import { environment } from 'src/environments/environment';


@Component({
  templateUrl: './join-game-dialog.component.html',
  styleUrls: ['./join-game-dialog.component.scss']
})
export class JoinGameDialogComponent implements OnInit, OnDestroy {

  formGroup: FormGroup = null;

  //todo refactor (come from constants)
  teams: ILabelValue[] = [{ label: TeamEnum[TeamEnum.Cats], value: TeamEnum.Cats }, { label: TeamEnum[TeamEnum.Mouse], value: TeamEnum.Mouse }];

  teamId: number = null;

  constructor(
    public dialogRef: MatDialogRef<JoinGameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IGameListItem,
    private signalrService: SignalrService,
    private router: Router) {
  }

  ngOnInit() {

    this.signalrService.subscribeToMethod("GameStart", (message: IGameStartMessage) => {

      console.log("AppComponent message", message);

      console.log("game start");

      this.router.navigate(['/play']);

      this.dialogRef.close();



    });

    console.log(this.data);

    //todo gamePAssword is required if this game has a password.

    const previousUserName = localStorage.getItem(`${environment.localStoragePrefix}user-name`);
    this.teamId = (this.data.teamId == TeamEnum.Cats ? TeamEnum.Mouse : TeamEnum.Cats);

    this.formGroup = new FormGroup({
      'userName': new FormControl(previousUserName || null, Validators.required),
      'teamId': new FormControl({ value: this.teamId, disabled: true }, Validators.required)
    });

    if (this.data.isPasswordProtected) {
      this.formGroup.addControl("gamePassword", new FormControl(null, Validators.required));
    }
  }

  isSubmitButtonDisabled(): boolean {
    return this.formGroup.invalid;
  }

  onSubmit(): void {

    const userName = this.formGroup.controls.userName.value;

    let message: any = {
      gameId: this.data.gameId,
      userName: userName
    };

    localStorage.setItem(`${environment.localStoragePrefix}user-name`, userName);

    if (this.data.isPasswordProtected) {
      message.gamePassword = this.formGroup.controls.gamePassword.value;
    }

    this.signalrService.sendMessage("JoinGame", message)
      .catch((reason: any) => {
        console.error(reason);
      });

  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    console.log("Destroy join game");
    this.signalrService.unsubscribeToMethod("GameStart");
  }

}
