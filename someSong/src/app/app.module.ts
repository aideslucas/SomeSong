import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {DeepLinkConfig, IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';


import { MyApp } from './app.component';

// Pages
import { HomePage } from '../pages/home/home';
import { BrowseQuestionsPage } from '../pages/browse-questions/browse-questions';
import { ProfilePage } from '../pages/profile/profile';
import { AskQuestionPage } from '../pages/ask-question/ask-question';
import { QuestionDetailsPage } from '../pages/question-details/question-details';
import { RegisterPage } from "../pages/register/register";
import { LoginPage } from '../pages/login/login';
import { LanguageSelectPage } from '../pages/language-select/language-select';
import { GenreSelectPage } from '../pages/genre-select/genre-select';
import { UploadQuestionPage } from '../pages/upload-question/upload-question';
import { LeaderboardPage } from '../pages/leader-board/leader-board';
import {ProgressBarComponent} from "../pages/progress-bar/progress-bar";

// Ionic Native
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Facebook } from "@ionic-native/facebook";
import { File } from "@ionic-native/file";
import { MediaPlugin } from "@ionic-native/media";
import { Camera } from "@ionic-native/camera";


// Providers
import { Auth } from '../providers/auth';
import {User} from "../providers/user";
import {Question} from "../providers/question";
import {Answer} from "../providers/answer";
import {Genre} from "../providers/genre";
import {Language} from "../providers/language";
import {Record} from "../providers/record";
import {Score} from "../providers/score";
import {Alert} from "../providers/alert";
import {Avatar} from "../providers/avatar";

// Firebase
import firebase from 'firebase'

import { keyValueFilterPipe} from '../assets/keyValueFilter';
import { SortAnswers} from '../assets/sortAnswers';
import { SortQuestions} from '../assets/sortQuestions';

import {Push} from "@ionic-native/push";
import {Notification} from "../providers/notification";
import {Deeplinks} from "@ionic-native/deeplinks";
import {FacebookShare} from "../providers/facebook-share";
import {FilterModalPage} from "../pages/filter-modal/filter-modal";
import {FilterQuestions} from "../assets/filterQuestions";
import {Geolocation} from "@ionic-native/geolocation";
import {Deletes} from "../providers/deletes";
import {SortScore} from "../assets/sortScore";
import {AngularFireAuthModule} from "angularfire2/auth";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {AngularFireModule} from "angularfire2";

export const firebaseConfig = {
  apiKey: "AIzaSyA_MquO5E-MQKjnEdaEUC-fnEXENMjz6Ro",
  authDomain: "somesong-700c4.firebaseapp.com",
  databaseURL: "https://somesong-700c4.firebaseio.com",
  projectId: "somesong-700c4",
  storageBucket: "somesong-700c4.appspot.com",
  messagingSenderId: "655905548469"
};

export const deepLinkConfig: DeepLinkConfig = {
  links: [
    { component: AskQuestionPage, name: 'AskQuestion', segment: 'askQuestion'},
    { component: QuestionDetailsPage, name: 'QuestionDetails', segment: 'question/:questionID' },
    { component: HomePage, name: 'HomePage', segment: 'home' }
  ]
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    BrowseQuestionsPage,
    ProfilePage,
    AskQuestionPage,
    QuestionDetailsPage,
    LoginPage,
    LanguageSelectPage,
    GenreSelectPage,
    RegisterPage,
    UploadQuestionPage,
    keyValueFilterPipe,
    LeaderboardPage,
    SortQuestions,
    SortAnswers,
    FilterModalPage,
    FilterQuestions,
    ProgressBarComponent,
    SortScore
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {}, deepLinkConfig),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    BrowseQuestionsPage,
    ProfilePage,
    AskQuestionPage,
    QuestionDetailsPage,
    LoginPage,
    LanguageSelectPage,
    GenreSelectPage,
    RegisterPage,
    UploadQuestionPage,
    LeaderboardPage,
    FilterModalPage,
    ProgressBarComponent
  ],
  providers: [
    Auth,
    User,
    Question,
    Answer,
    Deletes,
    Genre,
    Language,
    Record,
    StatusBar,
    SplashScreen,
    Facebook,
    File,
    MediaPlugin,
    Score,
    Push,
    Notification,
    Deeplinks,
    FacebookShare,
    Alert,
    Geolocation,
    Avatar,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
  constructor() {
    firebase.initializeApp(firebaseConfig);
  }
}
