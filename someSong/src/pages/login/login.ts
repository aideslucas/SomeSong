import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import {BackendService, User} from '../../providers/backend-service'
import {HomePage} from "../home/home";
import {AuthProviders} from "angularfire2";
import {LanguageSelectPage} from "../language-select/language-select";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  user: User;
  testS: string;

  constructor(public platform: Platform,
              public navCtrl: NavController,
              private _auth: AuthService,
              private _backend: BackendService) {
    if (this._auth.authenticated())
    {
      this.onSignInSuccess();
    }


  }

  loginWithFB() {
    this.testS = "0"
    this._auth.signInWithFacebook()
      .then(() => {this.testS = "1"; this.onSignInSuccess()});
  }

  loginWithGoogle() {
    this._auth.signInWithGoogle()
      .then(() => this.onSignInSuccess());
  }

  private onSignInSuccess(): void {
    this.testS = "a";
    var firstRun = true;

      this._backend.getUser(this._auth.authState.uid)
      .subscribe(user => {
        this.testS = "b";
        if (firstRun) {
          if (!user.userID) {
            let displayName = '';
            let email = '';

            if (this._auth.authState.provider == AuthProviders.Facebook) {
              displayName = this._auth.authState.facebook.displayName;
              email = this._auth.authState.facebook.email;
            }
            else if (this._auth.authState.provider == AuthProviders.Google) {
              displayName = this._auth.authState.google.displayName;
              email = this._auth.authState.google.email;
            }

            user = this._backend.createUser(this._auth.authState.uid,
              displayName,
              email);

            this.navCtrl.push(LanguageSelectPage, user);
          }

          else {
            this.navCtrl.setRoot(HomePage, user);
          }
          firstRun = false;
        }
      });
  }

}
