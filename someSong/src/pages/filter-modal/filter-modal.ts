import {Component} from '@angular/core';
import {AlertController, ModalController, NavParams, ViewController} from 'ionic-angular';
import {LanguageSelectPage} from "../language-select/language-select";
import {GenreSelectPage} from "../genre-select/genre-select";
import DictionaryHelpFunctions from "../../assets/dictionaryHelpFunctions";
import {User} from "../../providers/user";
import {Auth} from "../../providers/auth";

@Component({
  selector: 'page-filter-modal',
  templateUrl: 'filter-modal.html'
})
export class FilterModalPage {

  private selectedFilters: any;
  private defaultFilters: any;

  constructor(private viewController: ViewController,
              private navParams: NavParams,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private user: User,
              private auth: Auth) {

    this.selectedFilters = JSON.parse(JSON.stringify(this.navParams.data));
  }

  selectLocation() {
    let locationAlert = this.alertCtrl.create({
      title: 'Select Location Range',
      inputs: [{
        type: "radio",
        label: "Within 10KM",
        value: "10",
        checked: this.selectedFilters.selectedLocation.max == "10"
      }, {
        type: "radio",
        label: "Within 50KM",
        value: "50",
        checked: this.selectedFilters.selectedLocation.max == "50"
      }, {
        type: "radio",
        label: "Within 100KM",
        value: "100",
        checked: this.selectedFilters.selectedLocation.max == "100"
      }, {
        type: "radio",
        label: "Within 1000KM",
        value: "1000",
        checked: this.selectedFilters.selectedLocation.max == "1000"
      }, {
        type: "radio",
        label: "All Ranges",
        value: "All",
        checked: this.selectedFilters.selectedLocation.max == "All"
      }
      ],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
        }
      },
        {
          text: 'Apply',
          handler: data => {
            this.selectedFilters.selectedLocation.max = data;
          }
        }]
    });

    locationAlert.present();
  }

  selectAnswers() {
    let answersAlert = this.alertCtrl.create({
      title: 'Select Answers',
      inputs: [{
        type: "radio",
        label: "Resolved Questions",
        value: "Resolved",
        checked: this.selectedFilters.selectedAnswers == "Resolved"
      }, {
        type: "radio",
        label: "Unsolved Questions",
        value: "Unresolved",
        checked: this.selectedFilters.selectedAnswers == "Unresolved"
      }, {
        type: "radio",
        label: "Only Questions With Answers",
        value: "WithAnswers",
        checked: this.selectedFilters.selectedAnswers == "WithAnswers"
      }, {
        type: "radio",
        label: "All Questions",
        value: "All",
        checked: this.selectedFilters.selectedAnswers == "All"
      }
      ],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
        }
      },
        {
          text: 'Apply',
          handler: data => {
            this.selectedFilters.selectedAnswers = data;
          }
        }]
    });

    answersAlert.present();
  }

  selectGenres() {
    let genresModal = this.modalCtrl.create(GenreSelectPage, {selectedGenres: this.selectedFilters.selectedGenres});

    genresModal.onDidDismiss((data) => {
      this.selectedFilters.selectedGenres = data;
    });

    genresModal.present();
  }

  selectLanguages() {
    let languagesModal = this.modalCtrl.create(LanguageSelectPage, {selectedLanguages: this.selectedFilters.selectedLanguages});

    languagesModal.onDidDismiss((data) => {
      this.selectedFilters.selectedLanguages = data;
    });

    languagesModal.present();
  }

  private setDefaultFilters(): void {
    this.defaultFilters = {
      selectedLanguages: {},
      selectedGenres: {},
      selectedAnswers: "All",
      selectedFriends: "All",
      selectedLocation: {
        max: "All",
        dist: {}
      },
      selectedTitle: ""
    };

    this.user.CurrentUser.first().subscribe(data => {
      this.defaultFilters.selectedLanguages = data.languages;
      this.defaultFilters.selectedGenres = data.genres;
    });
  }

  clear() {
    this.setDefaultFilters();
    this.selectedFilters = JSON.parse(JSON.stringify(this.defaultFilters));
  }

  cancel() {
    this.clear();
    this.apply();
  }

  apply() {
    this.viewController.dismiss(this.selectedFilters);
  }
}
