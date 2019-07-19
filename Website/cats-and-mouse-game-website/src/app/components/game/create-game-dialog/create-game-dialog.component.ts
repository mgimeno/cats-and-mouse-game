import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ILabelValue } from 'src/app/shared/interfaces/label-value.interface';
import { MatDialogRef } from '@angular/material';
import { TeamEnum } from 'src/app/shared/enums/team.enum';
import { environment } from 'src/environments/environment';
import { SignalrService } from '../../../shared/services/signalr-service';


@Component({
  templateUrl: './create-game-dialog.component.html',
  styleUrls: ['./create-game-dialog.component.scss']
})
export class CreateGameDialogComponent implements OnInit {

  formGroup: FormGroup = null;
  isGameCreated: boolean = false;
  joinGameUrl: string = null;
  isJoinGameLinkCopiedToClipboard: boolean = false;

  //todo refactor (come from constants)
  teams: ILabelValue[] = [{ label: TeamEnum[TeamEnum.Cats], value: TeamEnum.Cats }, { label: TeamEnum[TeamEnum.Mouse], value: TeamEnum.Mouse }];

  constructor(public dialogRef: MatDialogRef<CreateGameDialogComponent>,
    private signalrService: SignalrService) { }

  ngOnInit() {
    this.formGroup = new FormGroup({
      'userName': new FormControl(null, Validators.required),
      'teamId': new FormControl(null, Validators.required),
      'gamePassword': new FormControl(null)
    });
  }

  isSubmitButtonDisabled(): boolean {
    return this.formGroup.invalid;
  }

  onSubmit(): void {
    console.log(this.formGroup.value);

    const message = {
      userName:  this.formGroup.controls.userName.value,
      teamId:  this.formGroup.controls.teamId.value,
      gamePassword:  this.formGroup.controls.gamePassword.value
    };

    this.signalrService.sendMessage("CreateGame", message)
      .then(() => {
        this.isGameCreated = true;

        //todo get gameId
        const gameId = "TestGameId";

        this.joinGameUrl = `${environment.websiteUrl}?joinGame=${gameId}`;

        console.log(this.joinGameUrl);
      })
      .catch((reason: any) => {
      });


  }

  onCopyLinkClick(): void {
    this.isJoinGameLinkCopiedToClipboard = true;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCancelGame(): void {
    //todo remove game 
    this.dialogRef.close();
  }
}
