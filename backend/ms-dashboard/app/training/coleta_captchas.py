import os
import random
import time

from selenium import webdriver
from selenium.webdriver.common.by import By

URL = "https://www.cmc.pr.gov.br/wspl/system/LogonForm.do"
PASTA_DESTINO = "captchas_brutos"

xpath_captcha = "//form[@name='LogonActionForm']//img[contains(@src, 'jcaptcha')]"

if not os.path.exists(PASTA_DESTINO):
    os.makedirs(PASTA_DESTINO)

driver = webdriver.Chrome()


def coletar_captchas(quantidade=500):
    for i in range(quantidade):
        driver.get(URL)

        try:
            captcha_element = driver.find_element(By.XPATH, xpath_captcha)
            file_name = f"captcha_{int(time.time())}_{i}.png"
            captcha_element.screenshot(os.path.join(PASTA_DESTINO, file_name))

            print(f"Coletado: {file_name}")

            time.sleep(random.uniform(1.0, 5.0))
        except Exception as e:
            print(f"Erro ao localizar captcha: {e}")
            break


coletar_captchas(500)
driver.quit()
