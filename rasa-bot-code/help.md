🔄 Common Commands
Train model         	rasa train
Test in terminal    	rasa shell
Run HTTP server     	rasa run --enable-api
Run actions server  	rasa run actions
Visualize stories   	rasa visualize
Start Rasa X        	rasa x

🗃️ Key Files Overview

    nlu.yml – Training examples for user inputs. >> Understanding user inputs with respect to intent

    stories.yml – How the bot should respond in conversations. >> Sequence of steps and actions against user inputs

    rules.yml – Rule-based dialogues.

    domain.yml – Intent, entities, slots, responses, etc. >> Responses wrt intents

    actions.py – Custom Python logic for the bot. 

    config.yml – ML pipeline and policy configuration.

Step	File	                        What You Do
1️⃣	domain.yml	                        Define intents, entities, slots, responses, and custom actions
2️⃣	nlu.yml	                            Add training examples for each intent and entities
3️⃣	stories.yml	                        Write user flow examples (intent → action)
4️⃣	rules.yml (optional but useful)	    Define rule-based responses or fallback logic
5️⃣	actions.py	                        Write custom Python code for dynamic actions
6️⃣	Train	                            Run rasa train to generate the model
7️⃣	Test / Iterate	                    Run rasa shell or rasa run, adjust flows as needed


rasa run --enable-api --cors "*" --port 5045 --model models/hi
rasa run --enable-api --cors "*" --port 5046 --model models/en

rasa train  --config config.yml --domain domain_hindi.yml --data data/hindi --out models/hi
