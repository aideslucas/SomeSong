/**
 * Created by Eylam Milner on 5/5/2017.
 */
import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {
  NavController, ViewController, Platform, LoadingController, AlertController,
  ModalController, NavParams
} from 'ionic-angular';
import {Question} from '../../providers/question'
import {User} from "../../providers/user";
import {File} from "@ionic-native/file";
import * as firebase from 'firebase';
import {FacebookShare} from "../../providers/facebook-share";
import {Alert} from '../../providers/alert';
import {Geolocation} from "@ionic-native/geolocation";
import {GenreSelectPage} from "../genre-select/genre-select";
import {LanguageSelectPage} from "../language-select/language-select";
import {MediaFile} from "@ionic-native/media-capture";
import {MediaObject} from "@ionic-native/media";

declare var Media: any;

@Component({
  selector: 'page-upload-question',
  templateUrl: 'upload-question.html',
})

export class UploadQuestionPage {
  public songGenres: {};
  public songLanguages: {};
  public submitAttempt: boolean = false;
  private recordPath: string;
  private userID: string;
  private title: string;
  private uploadForm: FormGroup;
  private recordingFile: MediaObject;
  private playing: boolean = false;
  private cordinates: any = null;
  private loading: any;
  private currUserData: any;
  private alertOnUploadFinish: any;
  private questionID: string;

  constructor(public navCtrl: NavController,
              private navParams: NavParams,
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
              private geolocation: Geolocation,
              private modalCtrl: ModalController) {
    this.title = '';

    this.user.currentUser.first().subscribe(data => {
      this.songGenres = data.genres;
      this.songLanguages = data.languages;
      this.currUserData = data;
    });

    this.geolocation.getCurrentPosition().then((data) => {
      this.cordinates = data.coords;
      console.log("ABC coords!: " + JSON.stringify(data.coords));
    }).catch(err => {
      console.log("ABC coords?: " + JSON.stringify(err));
    }) ;

    this.uploadForm = formBuilder.group({
      recordingTitle: ['', Validators.required]
    });

    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      console.log("Running in browser. we dont have a recording file to upload");
    }
    else {
      this.recordingFile = new Media("file:///storage/emulated/0/myRecording.mp3", () => {
      }, (error) => {
        this.alert.showAlert('OOPS...', `could not find your recording: ${JSON.stringify(error)}`, 'OK');
      }, (mediaStatus) => {
        if (mediaStatus === Media.MEDIA_STOPPED) {
          this.playing = false;
        }
      });
    }

    this.alertOnUploadFinish = this.alertCtrl.create({
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
            this.viewController.dismiss(this.questionID);
          }
        },
        {
          text: 'Go To Home',
          handler: () => {
            this.viewController.dismiss("home");
          }
        },
        {
          text: 'Share to Facebook',
          handler: () => {
            this.facebookShare.shareQuestion(this.questionID, this.title).then(() => {
              this.viewController.dismiss("home");
            }).catch(() => {
              this.viewController.dismiss("home");
            });
          }
        }]
    });
  }

  public playRecording() {
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
    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      alert("Running in browser.. not uploading recording to storage and DB.");
      this.alertOnUploadFinish.present();
    }
    else {
      this.submitAttempt = true;
      this.loading = this.loadingCtrl.create({content: "Please Wait..."});
      this.loading.present();
      this.questionID = this.question.getNewQuestionID();
      console.log("ABCABC got id " + this.questionID);
      this.saveRecordingStorage();
    }
  }

  private saveRecordingStorage(): void {
    let ref = firebase.storage().ref().child(`client-data/recordings/myRecording${this.questionID}.mp3`);
    let filePath = "file:///storage/emulated/0/";
    let fileName = "myRecording.mp3";

    console.log("ABCABC got ref to storage " + ref.toString());

    this.file.readAsArrayBuffer(filePath, fileName)
      .then((fileData) => {

        console.log("ABCABC got file data" + JSON.stringify(fileData));

        let blob = new Blob([fileData], {type: "audio/mp3"});
        var metadata = {
          contentType: 'audio/mp3'
        };

        var uploadTask:firebase.storage.UploadTask = ref.put(blob, metadata);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot: firebase.storage.UploadTaskSnapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          }, (error) => {
            this.loading.dismiss();
            this.alert.showAlert('OOPS...', `could not upload song: ${JSON.stringify(error)}`, 'OK');
          });

        uploadTask.then(() => {
            this.saveRecordingToDB();
        });
      }).catch((error) => {
        this.loading.dismiss();
        this.alert.showAlert('OOPS...', `could not read file: ${JSON.stringify(error)}`, 'OK');
      });
  }

  private saveRecordingToDB(): void {
    this.recordPath = `client-data/recordings/myRecording${this.questionID}.mp3`;
    this.user.currentUser.first().subscribe((data) => {
      this.userID = data.userID;

      this.question.writeNewQuestion(this.questionID, this.songGenres, this.songLanguages, this.recordPath, this.userID, this.title, this.cordinates)
        .then(() => {
          this.loading.dismiss();
          this.alertOnUploadFinish.present();
        })
        .catch((error) => {
          this.loading.dismiss();
          this.alert.showAlert('OOPS...', `could not save song to DB: ${JSON.stringify(error)}`, 'OK');
        });
    });
  }

  public editRecordingGenres() {
    let genres = this.modalCtrl.create(GenreSelectPage, {selectedGenres: this.songGenres});

    genres.onDidDismiss(data => {
      this.songGenres = data;
    });

    genres.present();
  }

  public editRecordingLanguages() {
    let lang = this.modalCtrl.create(LanguageSelectPage, {selectedLanguages: this.songLanguages});

    lang.onDidDismiss(data => {
      this.songLanguages = data;
    });

    lang.present();
  }
}
