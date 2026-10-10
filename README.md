# dofeFullStack
Docker/Azure setup: [Run all three apps in one container](docker/README.md).
## Domain: https://botpulse.xyz

## Email: admin@botpulse.xyz

### Disclaimer

This is a very much an "i'll wing it and try learn something new" project , and there will probably be alot of flaws but as long as it works i couldnt care less. This is a personal project and its not meant to be used and expanded upon, so this readme is also more of a progress thing for me to submit at the end so I understand that this isn't the slightest bit helpful.

## Vision for the project
---

Making a full stack website for DOFE silver. The website is gonna hopefully have an account system using OAuth, some bots running off of a home server, and a payment system using stripe API,and possibly integrating certain AI features in the future . I've changed the stack to a MERN stack, previously I was only going to use Petite VUE, a fork of regular VUE, and Firebase DB. I will be hosting it on AWS and use MongoDB as the database, MongoDB is alot more freeform compared to other databases like MySQL. Hopefully this website will be alive for longer than just a DOFE project,I did buy the domain for ages, and im hoping to implement some countermeasures against people creating many alt accounts as there will be a token based system on the website with the use of bots costing the user tokens.I will maybe expand it as a portfolio website of sorts or something else entirely. I built the base of the project following this youtube tutorial, https://www.youtube.com/watch?v=K8YELRmUb5o, up to about half way. You can see I shamelessly used his design as I am hopeless when it comes to designing a nice looking UI, believe me, I tried, what is a colour wheel. After implementing the basic authentication and cookies, I tried to ditch the tutorial and start designing the webpages myself. Im currently at the UI stage with plans to implement Oauth, stripe and an API system to my other server, which is currently dead, with about a month remaining for the project. Seeing as exams are over I should be able to no life this, and hopefully finish well within the remaining month, seeing how bored I am over Iceland I might even finish then. If i have time, id like to experiment with captcha's but thats something I see myself doing after the DOFE deadline.

### UPDATE 1
---

I've finished everything concerning the UI and im on the next stage of development with hosting and implementing stripe API, which is alot harder than I expected. Hoping to finish it by the 19th of March but no promises.

### UPDATE 2 
---

So ive procrastinated on this thing for ages, finally got the stripe api/webhook thing to work all thats left is some python flask stuff, eg hoping to make it so that the processing isnt done on the cloud server but locally by sending an api request or something (cloud hosting be expensive). Also now hosting on azure and not aws because github education gives $100 credit for it and i dont want to be spending more money than i have to. Probably gonna have to start building evidence for the dofe project. (also yes i leaked the test key but i rolled it relatively quickly, lets hope its not in a data set somewhere now)(also way over the theoretical deadline but it doesnt really matter)

### UPDATE 3
---

Okay the finish line is right infront of me, ive added some QoL stuff like widgets saying your login credentials are wrong and some stuff that instantly logs you in on registration instead of having to enter it manually. I've made an azure account and ive ditched flask for the second backend which will manage the python scripts as its simply too slow. Its also too resource intensive and i dont have too much to play with. I'll probably go for another node backend as im relatively familiar now with express and other packages, maybe later i'll switch to GO, because its somewhat faster and for the sake of learning something new. The python bot scripts have existed long before this project so i just need to recieve the API request and pass that data into the scripts and run them asyncronosly (mightve spelled that wrong). The only potential challenge lies in some sort of encryption considering it'll have to be an https request and i dont know too much about that yet, im also planning to make the rest of the server requests https but im not sure if i need any tls certificates or what not. Hosting a VM to run selenium shouldnt be too hard although it might require me to rework some of the stuff. Welp gl

### UPDATE 4 
---

Right, so i think the https thing should work? Cant test it locally for obvious reasons (tls/ssl certificates are specific to the domain), so im just gonna hope it should work in production. Ive also switched to digitalocean for the host as azure says "school" but apparently the difference between a university and school is foreign to them. So ive switched to digital ocean which, after reading some reddit posts and articles, might be a bit worse in terms of latency and general global coverage but should suffice for this project. The future upkeep cost is also noticably lower than azure (considering azure is just aws nicely repackaged with some bells and whistles, might be wrong dont kill me). 

So to finish off this project i need/want to add a couple of things:

• An autmotic token refund system and alert system, in the case that a game code is invalid or something else goes wrong

• A potentially more robuhst payment system, currently its using one link and just taking the userId as a parameter to fill out the order, but frankly im not quite sure how it would handle/what would happen if someone just copied the link and sent it to someone else, and they entered an email that wasnt in the database. Im assuming it would just break and get an error, which is true in some sense but in production the payment would still go through and i need to figure out a way to either prevent that entirely (could make an embeded payment page on my website but im hoping for some easier solutions, might have to resort to it though) or simply refund them if both values are not found/null. There could be a problem with refund/chargeback costs, as in the refund would cost me money as stripe takes a percentage cut but i would still have to pay the same amount to the user meaning i lose out on the difference, this happens to twitch streamers quite a lot. So thats a whole can of worms which im wondering if i should even care about as its quite unlikely, but at the same time just taking someones money feels morally wrong and knowingly leaving a vulnerablitly exposed doesnt feel right either.

• Dockerise the thing 

• Somehow slap NGINX infront of this and just generally figure out how to properly use NGINX, and then use it with docker

• Might ask some people much smarter than me to look over the authentication and some other stuff in case there are any glaring vulnerabilities, not too sure if an SQL injection is possible? Kind of hoping that either yup or mongoDB has some inbuilt stuff that deals with that. Although if someone attacks this website using an SQL injection i'll honestly be more surprised than mad.
Progress might slow down a little as the exam diet has started, although i'll try my best to dedicate atleast an hour a day
Theoretically not much is left but i have been saying that for some time so honestly im just trying my best to finish it at this point

### UPDATE 5
--- 

So its sort of been untouched, there are some minor changes but the bulk of the extra features will be added later as I simply dont have the time. The goal is to finish it by the end of this weekend and hopefully host it on either Cloudflare or DigitalOcean. I'll do a proper reflection after i get the project hosted but I feel I've learned alot. After using this on DofE this repo will probably be revamped, with me creating a duplicate repo which will be solely for future development.

### Final Update
---
So... thats it huh. This marks the end and completion of the DofE side of this project. Ofcourse as promised I will continue working on the website, adding new bots, features, etc etc, but it will mostly probably be in a private github repo. This project took *alot* longer than I thought for various reasons, laziness, procrastination, exams, other commitments, no motivation and so on, but here we are. In the end I achieved most of what I set out to do, with the current website features being
- Account system
- The ability to launch kahoot flood bots
- The ability to buy and spend tokens, with the the authentication framework basically done? might sneak that in during the following days
  
That mostly concludes the user requirements

But in all honesty I learned alot more about the backend and architectural side of full stack webdev
- I learned how to host on cloud providers and locally (did some testing on both, settled on hosting locally)
- Setting up load balancers and reverse proxies like NGinX
- How to use REST APIs
- Authenticating requests
- How to use modern software such as cloud flare and stripe
- How to use docker and isolationg processes for security reasons and what not
  
It was a fun project and im glad i did this for DofE

tldr: we're finally done

If you have any inquires or suggestions, either email me or just make a fork and submit a pull request

