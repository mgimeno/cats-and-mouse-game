import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ClipboardModule } from 'ngx-clipboard';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { LoaderInterceptor } from './shared/interceptors/loader.interceptor';
import { AboutComponent } from './components/about/about.component';
import { HowToPlayComponent } from './components/how-to-play/how-to-play.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { PlayGameComponent } from './components/game/play-game/play-game.component';
import { CreateGameDialogComponent } from './components/game/create-game-dialog/create-game-dialog.component';
import { JoinGameDialogComponent } from './components/game/join-game-dialog/join-game-dialog.component';
import { HomeComponent } from './components/home/home.component';
import { MatTableModule } from '@angular/material';
import { SignalrService } from './shared/services/signalr-service';


@NgModule({
  declarations: [
    AppComponent,

    AboutComponent,
    HowToPlayComponent,
    PageNotFoundComponent,

    CreateGameDialogComponent,
    JoinGameDialogComponent,
    PlayGameComponent,

    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatTableModule,
    ClipboardModule
  ],
  entryComponents: [
    CreateGameDialogComponent,
    JoinGameDialogComponent
  ],
  providers: [
    SignalrService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, disableClose: true, minWidth:310 } },
    //{ provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    //{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
