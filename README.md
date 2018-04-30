# Physics-Bot

## Introduction

Physics-Bot is a chat bot which can help you improve in Physics by asking questions depending on the topic chosen by the user. As of now it will take only integral answers and compare with original answers. Questions pop-up randomly with increasing difficulty and the bot waits for the user to respond with an appropriate answer to the question. The question database is small but helps you familiarize with basic concepts and problem solving in Physics.

## Setting-Up
There are some pre-requisites for the bot to run. Some basic softwares and packages to be installed for smooth running of the web-app.

### Install NodeJS
Install NodeJS up-to date stable version.

### Download Ngrok
You can download ngrok for conversion of localhost to https link as Facebook's Messenger requires an https link as webhook to communicate with the server. This is for the guys who don't have a proper source of server or for initial developmental purposes.

### Install various NodeJS packages.
There is a file named package.json which has all the required dependencies for the app to work. First check for npm --version to check whether npm is installed or not. If not install it. After this just change the directory to the bot folder and in terminal type npm install. This will install all the dependencies required for the bot to run.

### Connecting with Facebook Messenger
Click [here](http://developers.facebook.com/) to check and connect with Messenger using webhooks.

## File Breakdown

### server.js
The server file which communicates with Messenger.

### Fbeamer
The file contains a class and methods to send the message to FB in a particular fashion. You can refer to SendAPI for further enquires.

### Config
Basic configuration for the bot so that only a particular FB page can access it. You can change the configuration in config/dev.json 

### Kinematics, Dynamics and Conservation_Laws
The topics available for the bot to ask questions from. All the questions are in JSON format for easier understanding to add a question and for the server to present them without any errors.

### ngrok
The ngrok file uploaded is useful for ubuntu only. Mac and windows users can download it from [here](https://ngrok.com/).

## References
You can refer to the following for further exploration regrading chatbots.

1) [Facebook Developer Page](https://developers.facebook.com/docs/messenger-platform/getting-started).
2) [NodeJS](https://nodejs.org/en/).
3) [Chatbot Magazine](https://chatbotsmagazine.com/).

## Further Exploration
1) https://apps.worldwritable.com/tutorials/chatbot/
2) https://chatfuel.com/
3) https://dialogflow.com/docs/dialogs