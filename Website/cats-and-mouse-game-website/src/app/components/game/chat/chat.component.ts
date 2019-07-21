import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IChatLine } from '../../../shared/interfaces/chat-line.interface';
import { SignalrService } from '../../../shared/services/signalr-service';
import { IMessageToClient } from '../../../shared/interfaces/message-to-client.interface';
import { MessageToClientTypeEnum } from '../../../shared/enums/message-to-client-type.enum';
import { IChatMessage } from '../../../shared/interfaces/chat-message.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  formGroup: FormGroup = null;
  chatLines: IChatLine[] = [];

  constructor(private signalrService: SignalrService) {

    this.formGroup = new FormGroup({
      'message': new FormControl(null)
    });

  }

  ngOnInit() {
    this.signalrService.subscribeToMethod("messageToClient", (message: IMessageToClient) => {

      if (message.typeId === MessageToClientTypeEnum.ChatMessage) {

        const chatMessage: IChatMessage = message as IChatMessage;

        this.chatLines.push(chatMessage.chatLine);
      }
    });
  }

  isSubmitButtonDisabled(): boolean {
    return !this.formGroup.controls.message.value || !this.formGroup.controls.message.value.length;
  }

  onSubmit(): void {

    this.signalrService.sendMessage("SendChatMessage", { message: this.formGroup.controls.message.value })
      .then(() => {
        this.formGroup.controls.message.setValue(null);
      })
      .catch((reason: any) => {
        console.error(reason);
      });

  }
}
