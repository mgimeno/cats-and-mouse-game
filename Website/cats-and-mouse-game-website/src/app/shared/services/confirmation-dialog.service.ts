import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import { COMMON_CONSTANTS } from '../constants/common';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogService {

    constructor(private dialog: MatDialog) { }

    showConfirmationDialog(callback: Function,
        dialogBody?: string,
        dialogTitle?: string): void {

        this.showDialog("save", callback, dialogBody, dialogTitle);
    }

    showDeleteConfirmationDialog(callback: Function,
        dialogBody?: string,
        dialogTitle?: string): void {

        this.showDialog("delete", callback, dialogBody, dialogTitle);
    }

    private showDialog(dialogType: string,
        callback: Function,
        dialogBody?: string,
        dialogTitle?: string): void {
            
        // let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        //     data: { dialogType, dialogTitle, dialogBody },
        //     width: COMMON_CONSTANTS.CONFIRMATION_DIALOG_WIDTH
        // });

        // dialogRef.afterClosed().subscribe(result => {

        //     if (result && result.confirmed) {
        //         callback();
        //     }

        // });

    }
}
