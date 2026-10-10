# Imports
import selenium
from selenium import webdriver
from multiprocessing import Process
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import os
import time
import random
import sys

#Starting program and getting values

def start():
    try:
        # Getting the system arguments
        print(len(sys.argv), flush=True)
        game_code = int(sys.argv[1])
        bot_num = int(sys.argv[2])
        name = sys.argv[3]
        sessionId = sys.argv[4]
        print(f"Game code: {game_code}, Number of bots: {bot_num}, {name}, {sessionId}", flush=True)

        # Running the bots in parallel 
        runInParallel(bot_num, game_code,name, sessionId)
        sys.exit(0)  # Success
    except Exception as e:
        print(e, flush=True)
        sys.exit(1)  # Error

    # Function to run the bots in parallel and on seperate threads

def runInParallel(count, game_code,name, sessionId):
    proc = []
    for i in range(0, count):
        # Starting the main part of the program
        p = Process(target=play_game, args=(game_code,name, sessionId, ))
        p.start()
        proc.append(p)
    for p in proc:
        p.join()

#Main function for running the bot

def play_game(game_code,name,sessionId):
    #Defining options for the bot so it can run headless
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    if os.environ.get("CHROME_BIN"):
        chrome_options.binary_location = os.environ["CHROME_BIN"]
    service = Service(executable_path=os.environ.get("CHROMEDRIVER_PATH"))
    driver = webdriver.Chrome(service=service, options=chrome_options)
    print(f"status:running,sessionId:{sessionId}", flush=True)

    #Joining the kahoot (might optimize later)
    try:
        driver.get("https://www.kahoot.it")
    except Exception as e:
        print(f"status:error:{str(e)},sessionId:{sessionId}", flush=True)
        sys.exit(1)

    time.sleep(2)

    try:
        #Putting in game code
        pinInput = driver.find_element(By.NAME, "gameId")
        time.sleep(2)
        pinInput.send_keys(game_code)  
        pinInput.send_keys(Keys.RETURN)
    except Exception as e:
        print(f"status:error:{str(e)},sessionId:{sessionId}", flush=True)
        sys.exit(1)
        

    time.sleep(2)

    try:
        #Putting in botName
        nicInput = driver.find_element(By.NAME, "nickname")
        nicInput.send_keys(name + str(random.randint(0,10000)))
        nicInput.send_keys(Keys.RETURN)
    except Exception as e:
        print(e)
        print(f"status:error:{str(e)},sessionId:{sessionId}", flush=True)
        sys.exit(1)
    
    # While there are questions, they are answered
    while True:
        if len(driver.find_elements(By.CSS_SELECTOR, "[data-functional-selector=ranking-text]")) > 0:
            break
        # Finds some css selectors and then randomly click on them
        # The program will terminate after 3 minutes if it doesnt see any questions
        try:
            WebDriverWait(driver, 180).until(EC.presence_of_element_located((By.CSS_SELECTOR,'[data-functional-selector="answer-0"]')))
            answer = random.choice(driver.find_elements(By.CSS_SELECTOR, "[data-functional-selector^=answer]"))
            answer.click()
            time.sleep(10)
        except Exception as e:
            print(f"status:error:{str(e)},sessionId:{sessionId}", flush=True)
            sys.exit(1)

    #Error message
    print(f"status:completed,session:{sessionId}", flush=True)
    driver.quit()

#Standard convention for showing which file to execute

if __name__ == '__main__':
    start()

