import {Component} from '@angular/core';
import {AlertController, NavController, NavParams, Platform} from 'ionic-angular';

import {MediaPlugin} from "@ionic-native/media";
import {Question} from "../../providers/question";
import {User} from "../../providers/user";
import {Answer} from "../../providers/answer";
import {Record} from "../../providers/record";
import DictionaryHelpFunctions from "../../assets/dictionaryHelpFunctions";
import {Notification} from "../../providers/notification";
import {Score} from "../../providers/score";
import {Deletes} from "../../providers/deletes";
import {BrowseQuestionsPage} from "../browse-questions/browse-questions";
import {Auth} from "../../providers/auth";

declare var Media: any;

@Component({
  selector: 'page-question-details',
  templateUrl: 'question-details.html'
})
export class QuestionDetailsPage {
  question: any;
  questionAnswers = {};
  questionUser: any;
  answer: any;
  playing: boolean = false;
  questionSubs: any;
  currentUser: any;
  answerLoading = true;
  questionTime: any;

  answers: any;
  answerDetails: any;
  answerUserDetails: any;

  subscriptions = [];

  constructor(public navCtrl: NavController,
              private alertCtrl: AlertController,
              public navParams: NavParams,
              private _question: Question,
              private _record: Record,
              private _user: User,
              private _score: Score,
              private _answer: Answer,
              private _deletes: Deletes,
              private _notification: Notification,
              private _platform: Platform) {

      this.subscriptions.push(this._user.CurrentUser.subscribe(data => {
        this.currentUser = data;
      }));


    var paramsData = navParams.get('questionID') ? navParams.get('questionID') : navParams.data;

    this.subscriptions.push(this._question.getQuestionDetailsNew(paramsData).subscribe(question => {
      if (question) {
        this.question = question;
        this.questionTime = this._answer.getLocalTime(this.question.timeUTC);

        if (this._platform.is('mobileweb') || this._platform.is('core')) {
          console.log("Running in browser.. nothing to play");
        }
        else {
          this._record.getRecordURL(this.question.record).then(url => {
            this.question.file = new Media(url, () => {
            }, (e) => {
              alert("failed to create the recording file: " + JSON.stringify(e));
            }, (mediaStatus) => {
              if (mediaStatus === Media.MEDIA_STOPPED) {
                this.playing = false;
              }
            });
          });
        }

        this.subscriptions.push(this._user.getUserNew(this.question.user).subscribe(user => {
          this.questionUser = user;
        }));

        this.answers = this._question.getQuestionAnswersNew(this.question.questionID);
        this.answerUserDetails = {};
        this.answerDetails = {};
        this.subscriptions.push(this.answers.subscribe(answers => {
          answers.forEach(answer => {
            this.answerDetails[answer.$key] = this._answer.getAnswerDetailsNew(answer.$key);
            this.subscriptions.push(this.answerDetails[answer.$key].subscribe(details => {
              this.answerUserDetails[answer.$key] = this._user.getUserNew(details.user);
            }));
          });
        }));
      }
    }));
  }


  isEmpty(dictionary) {
    return DictionaryHelpFunctions.isEmpty(dictionary);
  }


  upVote(item, answer) {
    item.close();
    answer.votes++;
    if (this.currentUser.votes == null) {
      this.currentUser.votes = {};
    }

    if (this.currentUser.votes[answer.answerID] == null)
      this.currentUser.votes[answer.answerID] = 1;
    else
      this.currentUser.votes[answer.answerID]++;

    this._score.updateScore(3, answer.user.userID);

    this._user.updateUser(this.currentUser);
    this._answer.updateAnswer(answer);

    if (answer.votes % 10 == 0) {
      this._notification.writeNewNotification(answer.user, 2, this.question, answer);
    }
  }

  canVote(answer) {
    if (this.currentUser.votes != null && answer != null) {
      if (this.currentUser.votes[answer.answerID] != null) {
        return this.currentUser.votes[answer.answerID];
      }
    }

    return 0;
  }

  downVote(item, answer) {
    item.close();
    answer.votes--;

    if (this.currentUser.votes == null) {
      this.currentUser.votes = {};
    }

    if (this.currentUser.votes[answer.answerID] == null)
      this.currentUser.votes[answer.answerID] = -1;
    else
      this.currentUser.votes[answer.answerID]--;

    this._user.updateUser(this.currentUser);
    this._answer.updateAnswer(answer);
  }

  parseTime(timeUTC): string {
    return this._answer.getLocalTime(timeUTC);
  }

  resolve(item, answer) {
    item.close();
    this.question.correctAnswer = answer.answerID;
    let updatedQuestion = JSON.parse(JSON.stringify(this.question));
    this._question.updateQuestion(updatedQuestion);
    this._score.updateScore(2, answer.user.userID);

    this._notification.writeNewNotification(answer.user, 1, this.question, answer);
  }

  playRecording() {
    if (this.playing) {
      this.playing = false;
      this.question.file.pause();
    }
    else {
      this.playing = true;
      this.question.file.play();
    }
  }

  sendAnswer() {
    var ansKey = this._answer.writeNewAnswer(this.answer, this.currentUser.userID, this.question.questionID);
    this.answer = '';
    this._score.updateScore(1, this.currentUser.userID);
    if (this.currentUser.userID != this.question.user) {
      this._answer.getAnswerDetailsNew(ansKey).first().subscribe((answer) => {
        this._notification.writeNewNotification(this.question.user, 0, this.question, answer);
      });
    }
  }

  browseByGenre(genre) {
    this.navCtrl.push(BrowseQuestionsPage, {"genre": genre});
  }

  browseByLanguage(language) {
    this.navCtrl.push(BrowseQuestionsPage, {"language": language});
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

  deleteQuestion(question) {
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
            this.navCtrl.pop();
          }
        }
      ]
    });

    confirmAlert.present();
  }

  ionViewWillUnload() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
