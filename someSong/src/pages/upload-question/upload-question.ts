/**
 * Created by Eylam Milner on 5/5/2017.
 */
import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {NavController, ViewController, Platform, LoadingController, AlertController} from 'ionic-angular';
import {Question} from '../../providers/question'
import {User} from "../../providers/user";
import {File} from "@ionic-native/file";
import * as firebase from 'firebase';
import {FacebookShare} from "../../providers/facebook-share";
import {Alert} from '../../providers/alert';
import {Geolocation} from "@ionic-native/geolocation";
import {QuestionDetailsPage} from "../question-details/question-details";

declare var Media: any;

@Component({
  selector: 'page-upload-question',
  templateUrl: 'upload-question.html',
})

export class UploadQuestionPage {
  public songGenres: {};
  public songLanguages: {};
  private recordPath: string;
  private userID: string;
  private title: string;
  private uploadForm: FormGroup;
  public submitAttempt: boolean = false;
  private recordingFile: any;
  private playing: boolean = false;
  private cordinates: any;
  private loading: any;

  constructor(public navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private question: Question,
              private user: User,
              private file: File,
              private viewController: ViewController,
              private facebookShare: FacebookShare,
              private formBuilder: FormBuilder,
              private alertCtrl: AlertController,
              private alert: Alert,
              private platform: Platform,
              private geolocation: Geolocation) {

    this.title = '';

    this.user.currentUser.first().subscribe(data => {
      this.songGenres = data.genres;
      this.songLanguages = data.languages;
    });

    this.geolocation.getCurrentPosition().then((data) => {
      this.cordinates = data.coords;
    });

    this.uploadForm = formBuilder.group({
      recordingTitle: ['', Validators.required]
    })
  }

  public playRecording() {
    this.recordingFile = new Media("file:///storage/emulated/0/myRecording.amr", () => {
    }, (error) => {
      this.alert.showAlert('OOPS...', `could not upload song: ${JSON.stringify(error)}`, 'OK');
    }, (mediaStatus) => {
      if (mediaStatus === Media.MEDIA_STOPPED) {
        this.playing = false;
      }
    });

    if (this.playing) {
      this.playing = false;
      this.recordingFile.pause();
    }
    else {
      this.playing = true;
      this.recordingFile.play();
    }
  }

  public uploadRecording(): void {
    // if (this.platform.is('mobileweb') || this.platform.is('core')) {
    //   console.log("Running in browser");
    // }
    // else {
      this.submitAttempt = true;
      this.loading = this.loadingCtrl.create({content: "Please Wait..."});
      this.loading.present();
      let questionID = this.question.getNewQuestionID();
      this.saveRecordingToDB(questionID);
  //    this.saveRecordingToStorage(questionID);

      this.alertCtrl.create({
        title: "Upload Successfully",
        subTitle: "Your question:" + this.title + " has been uploaded successfully",
        buttons: [{
          text: 'Ask Another Question',
          handler: () => {
            this.viewController.dismiss("ask");
          }
        },
          {
            text: 'Go To Question',
            handler: () => {
              this.viewController.dismiss(questionID);
            }
          },
          {
            text: 'Go To Home',
            handler: () => {
              this.viewController.dismiss("home");
            }},
          {
            text: 'Share to Facebook',
            handler: () => {
              this.facebookShare.shareQuestion(questionID, this.title).then(() => {
                this.viewController.dismiss("home");
              }).catch( () => {
                this.viewController.dismiss("home");
              });
            }}]

      }).present();
    // }
  }

  private saveRecordingToDB(questionID: string): void {
    this.recordPath = `client-data/recordings/myRecording_${questionID}.amr`;
    this.user.currentUser.first().subscribe((data) => {
      this.userID = data.userID;

      this.question.writeNewQuestion(questionID, this.songGenres, this.songLanguages, null, this.recordPath, this.userID, this.title, this.cordinates).then((data) => {
        this.loading.dismiss();
      });
    });
  }

  private saveRecordingToStorage(questionID: string): void {
    let ref = firebase.storage().ref().child(`client-data/recordings/myRecording_${questionID}.amr`);
    let filePath = "file:///storage/emulated/0/";
    let fileName = "myRecording.amr";

    this.file.readAsArrayBuffer(filePath, fileName)
      .then((fileData) => {
        let blob = new Blob([fileData], {type: "audio/amr"});
        return ref.put(blob)
          .then((_) => {
            this.alert.showAlert('SUCCESS', 'Uploaded song!', 'OK');
          })
          .catch((error) => {
            this.alert.showAlert('OOPS...', `could not upload song: ${JSON.stringify(error)}`, 'OK');
          });
      })
      .catch((error) => {
        this.alert.showAlert('OOPS...', `could not read file: ${JSON.stringify(error)}`, 'OK');
      });
  }
}
