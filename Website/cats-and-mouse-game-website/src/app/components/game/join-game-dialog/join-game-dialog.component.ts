import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ILabelValue } from 'src/app/shared/interfaces/label-value.interface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IGameListItem } from 'src/app/shared/interfaces/game-list-item.interface';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { SignalrService } from '../../../shared/services/signalr-service';
import { MessageToClientTypeEnum } from '../../../shared/enums/message-to-client-type.enum';
import { IMessageToClient } from '../../../shared/interfaces/message-to-client.interface';
import { Router } from '@angular/router';


@Component({
  templateUrl: './join-game-dialog.component.html',
  styleUrls: ['./join-game-dialog.component.scss']
})
export class JoinGameDialogComponent implements OnInit{

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

    this.signalrService.subscribeToMethod("messageToClient", (message: IMessageToClient) => {

      console.log("AppComponent message", message);

      if (message.typeId === MessageToClientTypeEnum.GameStart) {

        console.log("game start");

        this.router.navigate(['/play']);

        this.dialogRef.close();

      }
    });

    console.log(this.data);

    //todo gamePAssword is required if this game has a password.

    this.teamId = (this.data.teamId == TeamEnum.Cats ? TeamEnum.Mouse : TeamEnum.Cats);

    this.formGroup = new FormGroup({
      'userName': new FormControl(null, Validators.required),
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

    let message: any = {
      gameId: this.data.gameId,
      userName: this.formGroup.controls.userName.value
    };

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
}
