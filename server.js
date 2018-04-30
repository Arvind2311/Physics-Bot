'use strict';

//Using Restify service we are creating a server to communicate with FB Messenger.
const Restify = require('restify');
const server = Restify.createServer({
	name:'Test'
});

//Modules are being imported. Each module contains questions based on their topic.
const kinematics = require('./kinematics');
const dynamics = require('./dynamics');
const claw = require('./conservation_laws');
let sample = kinematics;

//Some constant messages which occur frequently.
const WELCOME_MESSAGE="Hi There! I'm Physics Bot. I can help you improve in Physics. Just follow the instructions and answer the questions :D"
const HAPPY_MESSAGE="Correct!! :D :D"
const SAD_MESSAGE="Sorry :( The answer is: "

//Importing jsonp and bodyParser to convert message object of FB from string to JSON Object
server.use(Restify.jsonp());
server.use(Restify.bodyParser());

//Dedicating a port in the local server.
const PORT = process.env.PORT || 3000;
const config = require('./config');

//A class has been created so that the server and SendAPI of Messenger communicate with ease.
const FBeamer = require('./fbeamer');
const f = new FBeamer(config);

//Registering the server with Webhook.
server.get('/',(req,res,next)=>{
	f.registerHook(req,res);
	return next();
});

//Some constants required by the Bot.
let correctans=0,wrongans=0,increment=0;
let welcome=0,ans=0,ind=0,hintcount=0;
let topics =[{
	content_type:"text",
	title: "Kinematics",
	payload: "0"
},{
	content_type:"text",
	title: "Dynamics",
	payload: "1"
},{
	content_type:"text",
	title: "Conservation Laws",
	payload: "2"
}];
let choice = [{
	content_type:"text",
	title: "Yes",
	payload: "100"
},{
	content_type:"text",
	title: "No",
	payload: "101"
}]

//Post method of server to send messages as the bot.
server.post('/',(req,res,next)=>{
	f.incoming(req,res,msg => {
		//console.log("welcome flag: "+welcome);

		//Typing feel of FB Messenger(Kindof loading bar)
		f.sender_action(msg.sender,"typing_on",function(data){
			return null;
		})
		//Increases/Decreases the difficulty of quesitons.
		if(increment==-1){
			increment++;
		}else if(increment==3){
			increment--;
		}

		//Welcome message.
		if(welcome==0){
			welcome=1;
			f.txt(msg.sender,WELCOME_MESSAGE,function(data){
				f.quickreply(msg.sender,"Choose your topic.",topics,function(data){
					return null;
				})
			})
		}
		//Topic selection and question generation.
		else if(welcome==1&&ans==0){
			let n=parseInt(sample.length/3);
			if(msg.message.quick_reply!=undefined&&msg.message.quick_reply.payload==0){
				//console.log("kine");
				sample = kinematics;
				ind=parseInt((Math.random()*n)+(increment*n));
				ans=1;
				f.txt(msg.sender,sample[ind].qtext,function(data){
					return null;
				})
			}else if(msg.message.quick_reply!=undefined&&msg.message.quick_reply.payload==1){
				//console.log("dyn");
				sample = dynamics;
				//console.log(sample);
				ind=parseInt((Math.random()*n)+(increment*n));
				ans=1;
				f.txt(msg.sender,sample[ind].qtext,function(data){
					return null;
				})
			}else if(msg.message.quick_reply!=undefined&&msg.message.quick_reply.payload==2){
				//console.log("claw");
				sample = claw;
				ind=parseInt((Math.random()*n)+(increment*n));
				ans=1;
				f.txt(msg.sender,sample[ind].qtext,function(data){
					return null;
				})
			}else{
				f.txt(msg.sender,"Sorry I didn't quite get your message. Please choose from the options.",function(data){
					f.quickreply(msg.sender,"Choose your topic.",topics,function(data){
						return null;
					})
				})
			}
		}
		//Awaiting response and providing hints.
		else if(welcome==1&&ans==1){
			if(msg.message.text=="hint"){
				f.txt(msg.sender,sample[ind].hint,function(data){
					return null;
				})
			}
			let temp = parseFloat(msg.message.text);
			//If answered correctly increase difficulty.
			if(temp==sample[ind].ans){
				//welcome=0;ans=0;
				f.txt(msg.sender,HAPPY_MESSAGE,function(data){
					f.txt(msg.sender,"You can go to "+sample[ind].ref+" for further reference :)",function(data){
						correctans++;
						if(correctans==1){
							correctans=0;
							f.txt(msg.sender,"Increasing difficulty 3:-) ",function(data){
								increment++;
								if(increment==3){
									f.txt(msg.sender,"You have reached max difficulty :D :D . You might want to change to another topic :D",function(data){
										f.quickreply(msg.sender,"Would you like to continue??",choice,function(data){
											return null;
										})
									})
								}else{
									f.quickreply(msg.sender,"Would you like to continue??",choice,function(data){
										return null;
									})
								}
							})
						}else{
							f.quickreply(msg.sender,"Would you like to continue??",choice,function(data){
								return null;
							})
						}
					})
				})
			}
			//Continue Yes or No.
			else if(msg.message.quick_reply!=undefined&&msg.message.quick_reply.payload==100){
				ans=0;
				f.quickreply(msg.sender,"Choose your topic.",topics,function(data){
					return null;
				})
			}else if(msg.message.quick_reply!=undefined&&msg.message.quick_reply.payload==101){
				welcome=0;ans=0;correctans=0;wrongans=0;increment=0;
				f.txt(msg.sender,"Sorry to see you leave :( . All the best in your physics exam :D :D",function(data){
					return null;
				})
			}
			//If wrong answer received,it provides 2 chances with hint and finally decreases difficulty if wrong
			//answer is received yet again. 
			else{
				if(hintcount<2){
					hintcount++;
					f.txt(msg.sender,"Please try again",function(data){
						f.txt(msg.sender,"Hint: "+sample[ind].hint,function(data){
							return null;
						})
					})
				}else{
					hintcount=0;
					f.txt(msg.sender,SAD_MESSAGE+sample[ind].ans,function(data){
						f.txt(msg.sender,"You can go to "+sample[ind].ref+" for further reference :)",function(data){
							wrongans++;
							if(wrongans==1){
								wrongans=0;
								f.txt(msg.sender,"Decreasing difficulty :(  ",function(data){
									increment--;
									if(increment==-1){
										f.txt(msg.sender,"You need to brush up your concepts :( ",function(data){
											f.quickreply(msg.sender,"Would you like to continue??",choice,function(data){
												return null;
											})
										})
									}else{
										f.quickreply(msg.sender,"Would you like to continue??",choice,function(data){
											return null;
										})
									}
								})
							}else{
								f.quickreply(msg.sender,"Would you like to continue??",choice,function(data){
									return null;
								})
							}
						})
					})
				}
			}
		}
	})
})

//Subscribing to the page.
f.subscribe();

//Server listening in Port#****
server.listen(PORT,() => console.log(`Running on PORT: ${PORT}`));