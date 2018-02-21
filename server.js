'use strict';

const Restify = require('restify');
const server = Restify.createServer({
	name:'Test'
});
const sample = require('./sample');

const WELCOME_MESSAGE="Hi There! :D I'm Physics Bot. I can help you improve in Physics."


server.use(Restify.jsonp());
server.use(Restify.bodyParser());

const PORT = process.env.PORT || 3000;
const config = require('./config');

const FBeamer = require('./fbeamer');
const f = new FBeamer(config);

server.get('/',(req,res,next)=>{
	f.registerHook(req,res);
	return next();
});

let welcome=0,ans=0,ind=0;
let qrdata =[{
	content_type:"text",
	title: "Sample 1",
	payload: "0"
},{
	content_type:"text",
	title: "Sample 2",
	payload: "1"
}];
server.post('/',(req,res,next)=>{
	f.incoming(req,res,msg => {
		console.log(msg.message);
		if(welcome==0){
			welcome=1;
			f.txt(msg.sender,WELCOME_MESSAGE,function(data){
				f.quickreply(msg.sender,"Choose your topic.",qrdata,function(data){
					return null;
				})
			})
		}else if(welcome==1&&ans==0){
			if(msg.message.quick_reply!=undefined&&msg.message.quick_reply.payload!=0){
				f.txt(msg.sender,"Under development",function(data){
					f.quickreply(msg.sender,"Choose your topic",qrdata,function(data){
						return null;
					})
				})
			}
			else{
				ind=parseInt(Math.random()*sample.length);
				//console.log(ind+"\t"+sample.length);
				ans=1;
				f.txt(msg.sender,sample[ind].qtext,function(data){
					return null;
				})
			}
		}else if(welcome==1&&ans==1){
			let temp = parseFloat(msg.message.text);
			//console.log(temp);
			if(temp==sample[ind].ans){
				welcome=0;ans=0;
				f.txt(msg.sender,"Correct!! :D :D",function(data){
					return null;
				})
			}else{
				f.txt(msg.sender,"Please try again",function(data){
					f.txt(msg.sender,"Hint: "+sample[ind].hint,function(data){
						return null;
					})
				})
			}
		}
	})
})

f.subscribe();

server.listen(PORT,() => console.log(`Running on PORT: ${PORT}`));

