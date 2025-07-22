from models import db, Employee
from app import create_app

app = create_app()

with app.app_context():
    # Find the employee by ID, name, and role
    employee = Employee.query.filter_by(id=8, name='vaibhav', role='admin').first()

    if employee:
        employee.email = 'vaibhav@gmail.com'
        db.session.commit()
        print("Email updated successfully.")
    else:
        print("Employee not found.")
