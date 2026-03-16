from rasa_sdk import Action
from rasa_sdk.events import UserUtteranceReverted
from rasa_sdk import Action


class ActionDefaultFallback(Action):
    def name(self):
        return "action_default_fallback"
    
    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="Sorry, I didn't understand that.")
        return [UserUtteranceReverted()]

