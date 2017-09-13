import { Component } from '@angular/core';
import { NavController, ModalController, AlertController} from 'ionic-angular';
import {Auth} from "../../providers/auth";
import {LoginPage} from "../login/login";
import {User} from "../../providers/user";
import {GenreSelectPage} from "../genre-select/genre-select";
import {LanguageSelectPage} from "../language-select/language-select";
import {Score} from "../../providers/score";
import {LeaderboardPage} from "../leader-board/leader-board";
import {Avatar} from "../../providers/avatar";

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  currentUser: any;
  subscriptions = [];
  userPoints: any;
  userPosition: any;

  constructor(public navCtrl: NavController,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              private _auth: Auth,
              private _score: Score,
              private _user: User,
              private _avatar: Avatar)
  {
    this.subscriptions.push(this._user.currentUser.subscribe((data) => {
      this.currentUser = data;
      this.subscriptions.push(this._score.getScoreDetails(this.currentUser.userID).subscribe((scoreDetail) => {
        this.userPoints = scoreDetail;
        this._score.getPosition(data.userID).then(data => {
          this.userPosition = data;
        });
      }));
    }));
  }

  ionViewWillUnload() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  goToLanguageSelect(){
    var languageModal = this.modalCtrl.create(LanguageSelectPage, {selectedLanguages: this.currentUser.languages});
    languageModal.onDidDismiss(data => {
      this.currentUser.languages = data;
      this._user.updateUser(this.currentUser);
    });

    languageModal.present();
  }

  goToGenreSelect() {
    var genreModal = this.modalCtrl.create(GenreSelectPage,  {selectedGenres: this.currentUser.genres});
    genreModal.onDidDismiss(data => {
      this.currentUser.genres = data;
      this._user.updateUser(this.currentUser);
    });

    genreModal.present();
  }

  goToAvatar() {
    var genreModal = this.modalCtrl.create(GenreSelectPage,  { selectedGenres: this.currentUser.genres });
    genreModal.onDidDismiss(data => {
      this.currentUser.genres = data;
      this._user.updateUser(this.currentUser);
    });

    genreModal.present();
  }

  openImageOptions()
  {
    this._avatar.openImageOptions();
  }
  confirmLogout() {
    let confirmModal = this.alertCtrl.create({
      // let alert = this.alertCtrl.create({
      title: 'Confirm Log Out',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Log Out',
          handler: () => {
            console.log('Logged out');
            this.logout();
          }
        }
      ]
    });

    confirmModal.present();
  }

  logout() {
    this._user.logOut();
    this._auth.signOut();
    this.navCtrl.setRoot(LoginPage);
  }

  goToLeaderboard(){
    this.navCtrl.push(LeaderboardPage);
  }
}
