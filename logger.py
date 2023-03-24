class TextLogger:
    log_path = "log.txt"
    def __init__(self, log_path = "log.txt"):
        self.log_path = log_path

    def log(self, error):
        try:
            with open(self.log_path, "a") as log:
                from datetime import datetime
                log.write(f"{datetime.today()}: {error}\n")
        except:
            return "Ошибка!"


class JSONLogger:
    def __init__(self):
        pass

    def log(self):
        pass
