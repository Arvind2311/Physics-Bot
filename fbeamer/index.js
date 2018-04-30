'use strict';

const request = require('request');

class FBeamer{
	//Constructor method
	constructor(config){
		try{
			if(!config || config.PAGE_ACCESS_TOKEN === undefined || config.VERIFY_TOKEN === undefined){
				throw new Error("Unable to access tokens!");
			}
			else{
				this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = config.VERIFY_TOKEN;
			}
		}
		catch(e){
			console.log(e.stack);
		}
	}
	//Register Webhook method
		registerHook(req, res) {
			// If req.query.hub.mode is 'subscribe'
			// and if req.query.hub.verify_token is the same as this.VERIFY_TOKEN
			// then send back an HTTP status 200 and req.query.hub.challenge
			let {mode, verify_token, challenge} = req.query.hub;

			if(mode === 'subscribe' && verify_token === this.VERIFY_TOKEN) {
				return res.end(challenge);
			} else {
				console.log("Could not register webhook!");
				return res.status(403).end();
			}
		}
		//Subscribe to page method
		subscribe(){
			request({
				uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
				qs:{
					access_token:this.PAGE_ACCESS_TOKEN
				},
				method: 'POST'
			},(error,response,body) => {
				if(!error && JSON.parse(body).success){
					console.log("subscribed to the page");
				}
				else{
					console.log(error);
				}
			});
		}
		//Incoming message to bot method
		incoming(req,res,cb){
			let data=req.body;
			if(data.object ==='page'){
				data.entry.forEach(pageObj => {
					pageObj.messaging.forEach(msgEvent => {
						let messageObj = {
							sender: msgEvent.sender.id,
							timeOfMessage: msgEvent.timestamp,
							message: msgEvent.message
						}
						cb(messageObj);
					});
				});
			}
			res.send(200);
		}
		//Send Message method. Message has to be sent in a particular format.
		sendMessage(payload,cb){
			return new Promise((resolve,reject) => {
				//Create HTTP POST request
				request({
					uri:'https://graph.facebook.com/v2.6/me/messages',
					qs:{
						access_token: this.PAGE_ACCESS_TOKEN
					},
					method: 'POST',
					json: payload
				},(error,response,body) => {
					//console.log(response.statusCode+"\t"+(!error));
					if(!error && response.statusCode == 200){
						//console.log(response.statusCode);
						resolve({
							messageId:body.message_id
						});
						
					}
					else{
						reject(error);
					}
				});
			});
		}
		//The typing/loading kindof action
		sender_action(id,action,cb){
			let obj={
				recipient:{
					id
				},
				sender_action:action
			}
			this.sendMessage(obj)
				.then(function(response){
					cb(response);
				})
				.catch(error => console.log("sender_action error"+error));
		}
		//Send a plain text message.
		txt(id,text,cb){
			let obj={
				recipient:{
					id
				},
				message:{
					text
				}
			}
			this.sendMessage(obj)
				.then(function(response){
					cb(response);
				})
				.catch(error => console.log("txt fn error"+error));
		}
		//Send a response with some options for quick reply cases.
		quickreply(id,str,qr_data,cb){
			//console.log(qr_data);
			let obj={
				recipient:{
					id
				},
				message:{
					text:str,
					quick_replies:qr_data
				}
			}
			//console.log(obj.message);
			this.sendMessage(obj)
				.then(function(response){
					cb(response);
				})
				.catch(error => console.log("quickreply fn error"+error));
		}
}

module.exports = FBeamer;