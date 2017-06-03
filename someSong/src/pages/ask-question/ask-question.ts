import {Component} from '@angular/core';
import {NavController, ModalController, Platform} from 'ionic-angular';
import {File} from "@ionic-native/file";
import {UploadQuestionPage} from "../upload-question/upload-question";
import {Alert} from '../../providers/alert';
import {QuestionDetailsPage} from "../question-details/question-details";
import {HomePage} from "../home/home";

declare var Media: any;
declare var navigator: any;

@Component({
  selector: 'page-ask-question',
  templateUrl: 'ask-question.html'
})
export class AskQuestionPage {

  public isChecked: boolean = false;
  public recording: boolean = false;
  private recordingFile: any;
  private miliSecond: number = 0;
  private second: number = 0;
  private zeroPlaceholderSec: boolean = true;
  private zeroPlaceholderMil: boolean = true;
  private progress: number = 0;
  private progressBarInterval: number;
  private timeCounterInterval: number;

  constructor(public navCtrl: NavController,
              public file: File,
              private modalCtrl: ModalController,
              private alert: Alert,
              public platform: Platform) {
  }

  public RecordingToggle(): void {
    if (this.platform.is('mobileweb')) {
      if (!this.recording) {
        this.recording = true;
        this.isChecked = true;
        this.startTimeCounter();
        this.startProgressBar();
      }
      else {
        this.recording = false;
        this.isChecked = false;
        this.clearTimeCounter();
        this.clearProgressBar();
        this.startUploadProcess();
      }
    }
    else {
      if (!this.recording) {
        this.recording = true;
        this.isChecked = true;
        this.startTimeCounter();
        this.startProgressBar();
        this.startRecording();
      }
      else {
        this.recording = false;
        this.isChecked = false;
        this.clearTimeCounter();
        this.clearProgressBar();
        this.stopRecording();
      }
    }
  }

  public startRecording() {
    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      console.log("Running in browser, not really recording.");
    }
    else {
      this.recordingFile = new Media("myRecording.amr", ()=> {
      }, (e) => {
        this.alert.showAlert('OOPS...', `failed to create the recording file: " ${JSON.stringify(e)}`, 'OK');
      });
      this.recordingFile.startRecord();
    }
  }

  public stopRecording(): void {
    if (this.platform.is('mobileweb') || this.platform.is('core')) {
      this.startUploadProcess();
    }
    else {
      this.recordingFile.stopRecord();
      this.recordingFile.release();
      this.startUploadProcess();
    }
  }

  public startUploadProcess(): void {
    let upload = this.modalCtrl.create(UploadQuestionPage);

    upload.onDidDismiss((data) => {
      if (data == "home") {
        this.navCtrl.popToRoot();
      }
      else if (data == "ask") {

      }
      else {
        this.navCtrl.setPages([{"page": HomePage}, {"page": QuestionDetailsPage, "params": data}]);
      }
    });

    upload.present();
  }

  private startTimeCounter(): void {
    this.zeroPlaceholderMil = false;
    this.timeCounterInterval = setInterval(() => {
      this.miliSecond++;
      if (this.miliSecond === 99) {
        this.miliSecond = 0;
        this.second++;
      }
      if (this.second === 59) {
        this.second = 0;
      }
      if (this.second === 10) {
        this.zeroPlaceholderSec = false;
      }
      else if (this.second === 15) {
        this.RecordingToggle();
      }
    }, 10);
  }

  private startProgressBar(): void {
    this.progressBarInterval = setInterval(() => {
      if ((this.progress / 100) !== 1) {
        this.progress++;
      }
    }, 150);
  }

  private clearTimeCounter() {
    if (this.timeCounterInterval) {
      this.zeroPlaceholderSec = true;
      this.zeroPlaceholderMil = true;
      this.second = 0;
      this.miliSecond = 0;
      clearInterval(this.timeCounterInterval)
    }
  }

  private clearProgressBar() {
    if (this.progressBarInterval) {
      this.progress = 0;
      clearInterval(this.progressBarInterval)
    }
  }
}
