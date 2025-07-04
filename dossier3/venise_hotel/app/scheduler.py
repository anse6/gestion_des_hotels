from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from app.modules.reservation.services import search_room_reservations
from app.email_service import send_reminder_email

def send_reminder_emails():
    target_date = datetime.utcnow().date() + timedelta(days=2)
    params = {
        'to_date': target_date,
        'status': 'confirmée'
    }
    reservations, err = search_room_reservations(params=params)
    if reservations:
        for res in reservations:
            send_reminder_email(res.email, res)

def init_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=send_reminder_emails, trigger="interval", hours=24)
    scheduler.start()

    import atexit
    atexit.register(lambda: scheduler.shutdown())
