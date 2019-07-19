import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ILabelValue } from 'src/app/shared/interfaces/label-value.interface';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IGameListItem } from 'src/app/shared/interfaces/game-list-item.interface';
import { TeamEnum } from 'src/app/shared/enums/team.enum';


@Component({
  templateUrl: './join-game-dialog.component.html',
  styleUrls: ['./join-game-dialog.component.scss']
})
export class JoinGameDialogComponent {

  formGroup: FormGroup = null;

  //todo refactor (come from constants)
  teams: ILabelValue[] = [{label: TeamEnum[TeamEnum.Cats], value: TeamEnum.Cats},{label: TeamEnum[TeamEnum.Mouse], value: TeamEnum.Mouse}];

  teamId: number = null;

  constructor(public dialogRef: MatDialogRef<JoinGameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IGameListItem) { }

  ngOnInit() {

    console.log(this.data);

    //todo gamePAssword is required if this game has a password.

    this.teamId = (this.data.teamId == TeamEnum.Cats ? TeamEnum.Mouse : TeamEnum.Cats);

    this.formGroup = new FormGroup({
      'userName': new FormControl(null, Validators.required),
      'teamId': new FormControl({value: this.teamId, disabled: true}, Validators.required)
    });

    if(this.data.isPasswordProtected){
      this.formGroup.addControl("gamePassword", new FormControl(null, Validators.required));
    }
  }

  isSubmitButtonDisabled(): boolean {
    return this.formGroup.invalid;
  }

  onSubmit(): void {
    console.log(this.formGroup.value);
  }

  onCancel(): void{
    this.dialogRef.close();
  }
}