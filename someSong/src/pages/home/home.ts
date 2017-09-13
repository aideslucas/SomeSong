import {ChangeDetectorRef, Component} from '@angular/core';
import {AlertController, LoadingController, NavController} from 'ionic-angular';

import {ProfilePage} from "../profile/profile";
import {QuestionDetailsPage} from "../question-details/question-details";
import {AskQuestionPage} from "../ask-question/ask-question";
import {BrowseQuestionsPage} from "../browse-questions/browse-questions";

import {User} from "../../providers/user";
import {Answer} from "../../providers/answer";
import {Question} from "../../providers/question";
import DictionaryHelpFunctions from "../../assets/dictionaryHelpFunctions";

import {Push, PushObject, PushOptions} from '@ionic-native/push'
import {LeaderboardPage} from "../leader-board/leader-board";
import {Deletes} from "../../providers/deletes";
import {Auth} from "../../providers/auth";
import {LoginPage} from "../login/login";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  questionLoading = true;
  answerLoading = true;

  user: any;
  userQuestions: { [id: string]: any } = {};
  userAnswers = {};

  questions: any;
  questionDetails: any;
  subscriptions = [];
  answers: any;
  answerDetails: any;
  answerQuestionDetails: any;

  constructor(public navCtrl: NavController,
              private alertCtrl: AlertController,
              private _auth: Auth,
              private _user: User,
              private _answer: Answer,
              private _question: Question,
              private _deletes: Deletes,
              private _push: Push) {
    if (this._auth.authenticatedUser != null) {
      this.subscriptions.push(this._user.CurrentUser.subscribe(data => {
        this.user = data;
        this.initPushNotifications();

        this.questions = this._user.getUserQuestionsNew(this.user.userID);
        this.questionDetails = {};
        this.subscriptions.push(this.questions.subscribe(questions => {
          questions.forEach(question => {
            this.questionDetails[question.$key] = this._question.getQuestionDetailsNew(question.$key);
          });
        }));

        this.answers = this._user.getUserAnswersNew(this.user.userID);
        this.answerDetails = {};
        this.answerQuestionDetails = {};
        this.subscriptions.push(this.answers.subscribe(answers => {
          answers.forEach(answer => {
            this.answerDetails[answer.$key] = this._answer.getAnswerDetailsNew(answer.$key);


            this.subscriptions.push(this.answerDetails[answer.$key].subscribe(answerDetails => {
              this.answerQuestionDetails[answer.$key] = this._question.getQuestionDetailsNew(answerDetails.question);
            }));
          });
        }));

      }));
    }
  }

  initPushNotifications() {
    const options: PushOptions = {
      android: {
        senderID: '655905548469'
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      windows: {}
    };

    const pushObject: PushObject = this._push.init(options);

    pushObject.on('notification').subscribe((notification: any) => {
      if (notification.additionalData.foreground) {
        // if application open, show popup
        let notificationAlert = this.alertCtrl.create({
          title: notification.title,
          message: notification.message,
          buttons: [{
            text: 'Ignore',
            role: 'cancel'
          }, {
            text: 'View',
            handler: () => {
              this.navCtrl.push(QuestionDetailsPage, notification.additionalData.questionID);
            }
          }]
        });

        notificationAlert.present();
      } else {
        this.navCtrl.push(QuestionDetailsPage, notification.additionalData.questionID);
      }
    });

    pushObject.on('registration').subscribe((registration: any) => {
      this.user.token = registration.registrationId;
      this._user.updateUser(this.user);
    });

    pushObject.on('error').subscribe(error => alert('Error with Push plugin' + JSON.stringify(error)));
  }

  isEmpty(dictionary) {
    return DictionaryHelpFunctions.isEmpty(dictionary);
  }

  goToProfile() {
    this.navCtrl.push(ProfilePage);
  }

  goToQuestion(questionID) {
    this.navCtrl.push(QuestionDetailsPage, questionID);
  }

  askAQuestion() {
    this.navCtrl.push(AskQuestionPage);
  }

  browseQuestions() {
    this.navCtrl.push(BrowseQuestionsPage);
  }

  deleteAnswer(item, answer) {
    item.close();

    let confirmAlert = this.alertCtrl.create({
      title: "Are you sure?",
      subTitle: "Are you sure you want to delete this answer: " + answer.content,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            this._deletes.deleteAnswer(answer);
          }
        }
      ]
    });

    confirmAlert.present();
  }

  deleteQuestion(item, question) {
    item.close();

    let confirmAlert = this.alertCtrl.create({
      title: "Are you sure?",
      subTitle: "Are you sure you want to delete this question: " + question.title,
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            this._deletes.deleteQuestion(question);
          }
        }
      ]
    });

    confirmAlert.present();
  }

  ionViewWillUnload() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  goToLeaderboard() {
    this.navCtrl.push(LeaderboardPage);
  }
}
