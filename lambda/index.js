/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const firebase = require('firebase/app');
require('firebase/database');

// PLEASE FILL IN YOUR VALUES INSIDE CONFIG OBJECT. REFER TO THIS TUTORIAL TO GET STARTED : 

const config = {
   apiKey: "API_KEY",
   authDomain: "PROJECT_ID.firebaseapp.com",
   databaseURL: "https://PROJECT_ID.firebaseio.com",
   projectId: "PROJECT_ID",
   storageBucket: "PROJECT_ID.appspot.com",
   messagingSenderId: "SENDER_ID",
   appId: "APP_ID",
   measurementId: "G-MEASUREMENT_ID",
};

firebase.initializeApp(config);
const database = firebase.database();

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome! You can record your Mood right now. For example, say "Add cool" ';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const InputIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InputIntent';
    },
    async handle(handlerInput) {
        const moodSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'mood');
        let speakOutput = '';
        try{
            firebase.database().goOnline();
            var current = new Date();
            var date = current.toLocaleDateString();
            var time = current.toLocaleTimeString();
            await database.ref('/Moods/' + moodSlot).set({
            TIME : time,
            DATE : date 
        })
        firebase.database().goOffline();
        
      if (moodSlot) {
      let resolution = handlerInput.requestEnvelope.request.intent.slots.mood.resolutions.resolutionsPerAuthority[0];
      if (resolution.status.code === "ER_SUCCESS_MATCH") {
        let mood = resolution.values[0].value.id;
        switch (mood) {
          case "1":
            speakOutput = `I just added your mood. But I'm very sorry to hear that you're feeling ${moodSlot}. You can always cheer up!`;
            break;
          case "2":
            speakOutput = `Got it. I've added your mood to the list. You can try and relax to feel better!`;
            break; 
          case "3":
            speakOutput = `I understand that you're ${moodSlot} right now & I've added that to your list. Watching a movie can help you get over this!`;
            break;
          case "4":
            speakOutput = `Ah! You're ${moodSlot}. Okay! I'll not bother you now.`;
            break;
          case "5":
            speakOutput = `That's good to hear! I've added this mood to the list`;
            break;
          case "6":
            speakOutput = `wow!! I'm so glad to hear that. `;
            break;
          case "7":
            speakOutput = `Amazing! If you're feeling ${moodSlot} then I bet you're having a great time now!`;
            break;
          case "8":
            speakOutput = `Great! That made me ${moodSlot} too! Added this.`;
            break;
          default:
            speakOutput = `Okay, i just added this.`;
            break;
        }
        }
        }
        }catch(e){
            console.log("Catch logs here: ",e);
            speakOutput = `There was a problem adding the ${moodSlot}`
        }
        console.log("Out of Try Catch");
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        InputIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();