import {Component} from '@angular/core';
import {LoadingController, Modal, ModalController, NavController, NavParams, Platform} from 'ionic-angular';

import {Auth} from '../../providers/auth';
import {User} from "../../providers/user";

import {HomePage} from "../home/home";
import {LanguageSelectPage} from "../language-select/language-select";
import {RegisterPage} from "../register/register";
import {GenreSelectPage} from "../genre-select/genre-select";
import {Score} from "../../providers/score";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  form: any;
  error: any;
  authStateChanged: any;
  loader: any;
  registerModal: Modal;

  constructor(public platform: Platform,
              public params: NavParams,
              public loadingCtrl: LoadingController,
              public navCtrl: NavController,
              public modalCtrl: ModalController,
              private _auth: Auth,
              private _score: Score,
              private _user: User) {
    this.form = {
      email: '',
      password: ''
    };


    this.loader = this.loadingCtrl.create({
      content: 'Please  login...'
    });

    this.listenToLogin();
  }

  listenToLogin() {
    this.authStateChanged = this._auth.authState.subscribe(authUser => {
      if (authUser != null) {
        this._score.writeNewScore(authUser.uid);
        this._user.logIn();
        this._user.getUserNew(authUser.uid).first().subscribe(user => {
          if (user == null) {
            var displayName, email, image;
            this.loader.present();

            authUser.providerData.forEach(function (profile) {
              displayName = profile.displayName;
              email = profile.email;
              image = profile.photoURL;
            });

            this._user.createUser(authUser.uid, displayName, email, image).then(() => {
              var user;
              this._user.currentUser.first().subscribe(data => {
                user = data;

                this.loader.dismiss();

                var languageModal = this.modalCtrl.create(LanguageSelectPage, {selectedLanguages: {}});
                languageModal.onDidDismiss(data => {
                  user.languages = data;
                  var genreModal = this.modalCtrl.create(GenreSelectPage, {selectedGenres: {}});
                  genreModal.onDidDismiss(data => {
                    user.genres = data;
                    this._user.updateUser(user);
                    this.navCtrl.setRoot(HomePage);
                  });

                  genreModal.present();
                });
                languageModal.present();
              });
            });
          }
          else if (user.languages == null) {
            var user;
            this._user.currentUser.first().subscribe(data => {
              user = data;

              var languageModal = this.modalCtrl.create(LanguageSelectPage, {selectedLanguages: {}});
              languageModal.onDidDismiss(data => {
                user.languages = data;
                var genreModal = this.modalCtrl.create(GenreSelectPage, {selectedGenres: {}});
                genreModal.onDidDismiss(data => {
                  user.genres = data;
                  this._user.updateUser(user);
                  this.navCtrl.setRoot(HomePage);
                });

                genreModal.present();
              });
              languageModal.present();

            });
          }
          else {
            this.navCtrl.setRoot(HomePage);
          }
        });
      }
    });
  }

  loginWithEmail() {
    this._auth.signInWithEmail(this.form.email, this.form.password).catch(error => this.error = error);
  }

  register() {
    this.registerModal = this.modalCtrl.create(RegisterPage);
    this.registerModal.onDidDismiss(data => {
      this.listenToLogin();
    });
    this.authStateChanged.unsubscribe();
    this.registerModal.present();
  }

  resetPassword() {

  }

  loginWithFB() {
    this._auth.signInWithFacebook();
  }

  ionViewWillUnload() {
    this.authStateChanged.unsubscribe();
  }
}
