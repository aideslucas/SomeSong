import {Component} from '@angular/core';
import {AlertController, ModalController, NavController, NavParams} from 'ionic-angular';
import {Question} from "../../providers/question";
import {QuestionDetailsPage} from "../question-details/question-details";
import {FilterModalPage} from "../filter-modal/filter-modal";
import {User} from "../../providers/user";
import {AskQuestionPage} from "../ask-question/ask-question";
import {Geolocation} from "@ionic-native/geolocation";
import DictionaryHelpFunctions from "../../assets/dictionaryHelpFunctions";
import {Auth} from "../../providers/auth";

@Component({
  selector: 'page-browse-questions',
  templateUrl: 'browse-questions.html'
})
export class BrowseQuestionsPage {
  distances = {};

  selectedFilters = {
    selectedLanguages: {},
    selectedGenres: {},
    selectedAnswers: "All",
    selectedFriends: "All",
    selectedLocation: {
      max: "All",
      dist: this.distances
    },
    selectedTitle: ""
  };

  questions: any;

  questionLoading = true;

  orderBy: any = "Recent";
  currentLocation: any;

  subscriptions = [];

  constructor(public navCtrl: NavController,
              private params: NavParams,
              private modalCtrl: ModalController,
              public alertCtrl: AlertController,
              private geolocation: Geolocation,
              private _user: User,
              private _question: Question,
              private _auth: Auth) {

    let paramsLang = this.params.get("language");
    if (paramsLang != null) {
      this.selectedFilters.selectedLanguages[paramsLang.key] = paramsLang.value;
    }

    let paramsGenre = this.params.get("genre");
    if (paramsGenre != null) {
      this.selectedFilters.selectedGenres[paramsGenre.key] = paramsGenre.value;
    }

    this.subscriptions.push(this._user.CurrentUser.subscribe(data => {
      if (DictionaryHelpFunctions.isEmpty(this.selectedFilters.selectedLanguages))
        this.selectedFilters.selectedLanguages = data.languages;
      if (DictionaryHelpFunctions.isEmpty(this.selectedFilters.selectedGenres))
        this.selectedFilters.selectedGenres = data.genres;
    }));

    this.questions = this._question.getQuestions();
    this.subscriptions.push(this.questions.subscribe(questions => {
      questions.forEach(question => {
        this.subscriptions.push(this._question.getQuestionDetailsNew(question.$key).subscribe(details => {
          this.distances[question.$key] = this.calculateDistance(details.coordinates);
        }));
      });
    }));

    this.getLocation();
  }

  ionViewWillUnload() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getLocation() {
    this.geolocation.getCurrentPosition({enableHighAccuracy: true, timeout: 2000}).then((data) => {
      this.currentLocation = data.coords;
      for (let quest of this.questions) {
        this.distances[quest.$key] = this.calculateDistance(quest.coordinates);
      }
    });
  }

  goToQuestion(questionID) {
    this.navCtrl.push(QuestionDetailsPage, questionID);
  }

  filter() {
    let filterModal = this.modalCtrl.create(FilterModalPage, this.selectedFilters);

    filterModal.onDidDismiss((data) => {
      this.selectedFilters = data;
      this.selectedFilters.selectedLocation.dist = this.distances;
    });

    filterModal.present();
  }

  doRefresh(refresher) {
    this.getLocation();
    refresher.complete();
  }

  isEmpty(dictionary) {
    return DictionaryHelpFunctions.isEmpty(dictionary);
  }

  order() {
    let orderAlert = this.alertCtrl.create({
      title: 'Select Order',
      inputs: [{
        type: "radio",
        label: "Resolved First",
        value: "Resolved",
        checked: this.orderBy == "Resolved"
      }, {
        type: "radio",
        label: "Most Answers",
        value: "Answers",
        checked: this.orderBy == "Answers"
      }, {
        type: "radio",
        label: "Most Recent",
        value: "Recent",
        checked: this.orderBy == "Recent"
      }, {
        type: "radio",
        label: "Most Close to Me",
        value: "Location",
        checked: this.orderBy == this.distances
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
            if (data == "Location") {
              this.orderBy = this.distances;
            }
            else
              this.orderBy = data;
          }
        }]
    });

    orderAlert.present();
  }

  askAQuestion() {
    this.navCtrl.push(AskQuestionPage);
  }

  calculateDistance(questionCoords) {
    if (questionCoords && this.currentLocation) {
      var p = 0.017453292519943295;    // Math.PI / 180
      var c = Math.cos;
      var a = 0.5 - c((this.currentLocation.latitude - questionCoords.latitude) * p) / 2 +
        c(questionCoords.latitude * p) * c(this.currentLocation.latitude * p) *
        (1 - c((this.currentLocation.longitude - questionCoords.longitude) * p)) / 2;

      return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    }
    return 9999999;
  }
}
