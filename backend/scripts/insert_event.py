from app.db.session import SessionLocal
from app.models import Event
from datetime import datetime, timedelta


def main():
    db = SessionLocal()
    try:
        # pick any existing user as organizer
        from sqlalchemy import text
        row = db.execute(text('select id from users limit 1')).first()
        if not row:
            print('No users found; cannot create event')
            return 1
        organizer_id = row[0]

        start = datetime.utcnow() + timedelta(days=2)
        end = start + timedelta(hours=3)
        e = Event(
            title='Backend Insert Event',
            description='Inserted via backend script',
            start_at=start,
            end_at=end,
            location='Main Stage',
            category='Talk',
            max_participants=100,
            status='published',
            organizer_id=organizer_id,
        )
        db.add(e)
        db.commit()
        db.refresh(e)
        print('Inserted event id=', e.id)
        return 0
    except Exception as ex:
        print('Error inserting event:', ex)
        return 2
    finally:
        db.close()


if __name__ == '__main__':
    raise SystemExit(main())
