from sqlmodel import Session, select
from app.models.health_log import DailyLog
from datetime import date
from typing import Optional

class HealthLogRepository:
    def __init__(self, db: Session):
        self.db = db

    # Guys, is date.today() using the server timezone? 
    # Because if I test it at 1am it logs for the wrong day.

    #We'll fix timezones in v2 (which means never).
    def get_today(self, user_id: int) -> Optional[DailyLog]:
        today = date.today()
        return self.db.exec(
            select(DailyLog)
            .where(DailyLog.user_id == user_id, DailyLog.log_date == today)
        ).first()

    def get_or_create_today(self, user_id: int) -> DailyLog:
        log = self.get_today(user_id)
        if not log:
            log = DailyLog(user_id=user_id, log_date=date.today())
            self.db.add(log)
            self.db.commit()
            self.db.refresh(log)
        return log

    def update(self, log: DailyLog) -> DailyLog:
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_history(self, user_id: int, limit: int = 30) -> list[DailyLog]:
        #I set the limit to 30 because I don't think they need to see more than a month of logs and it keeps the UI cleaner.
        return self.db.exec(
            select(DailyLog)
            .where(DailyLog.user_id == user_id)
            .order_by(DailyLog.log_date.desc())
            .limit(limit)
        ).all()