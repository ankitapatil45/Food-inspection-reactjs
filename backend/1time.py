from app import create_app  # Import your factory function
from models import db, City

app = create_app()  # ✅ Create the app instance here

PREDEFINED_AREAS = [
    "Shivajinagar", "Kothrud", "Baner", "Hinjewadi", "Wakad",
    "Aundh", "Kharadi", "Viman Nagar", "Hadapsar", "Camp",
    "Kondhwa", "Katraj", "Pimpri", "Chinchwad", "Akurdi",
    "Nigdi", "Ravet", "Pimple Saudagar", "Pimple Gurav", "Thergaon"
]



with app.app_context():
    for area in PREDEFINED_AREAS:
        if not City.query.filter_by(name=area).first():
            db.session.add(City(name=area))
    db.session.commit()
    print("✅ Cities seeded successfully.")
