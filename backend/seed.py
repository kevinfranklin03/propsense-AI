from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from main import Base, User, Ticket, Property, DATABASE_URL
from datetime import datetime
import random

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def seed_data():
    print("Seeding realistic commercial data...")
    
    # 1. Clear existing data and recreation tables to ensure schema is correct
    print("Dropping and recreating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 2. Add Users (Tenants)
    tenant_names = [
        "Sarah Jenkins", "Michael O'Connor", "Priya Patel", "David Smith", 
        "Emma Wilson", "James Chen", "Fatima Al-Sayed", "Robert Taylor", 
        "Linda Thomas", "Gary White"
    ]
    users = []
    for i, name in enumerate(tenant_names):
        user = User(
            name=name,
            email=f"{name.split()[0].lower()}.{name.split()[1].lower()}@example.com",
            phone=f"07700 900{i:03d}"
        )
        db.add(user)
        users.append(user)
    db.commit() # Commit to get IDs

    # 3. Add Properties (London Cluster)
    # Center around London (51.5074, -0.1278)
    base_lat = 51.5074
    base_long = -0.1278
    
    streets = ["Oak Avenue", "Maple Drive", "High Street", "Church Lane", "Station Road", "Park View"]
    properties = []
    
    # Add one specifically for the simulator with ID 1
    sim_prop = Property(
        address="10 Downing Street (Sensor 01)", 
        tenant_name="Prime Minister", 
        status="Occupied",
        risk_level="Low",
        lat=base_lat + 0.001,
        long=base_long + 0.001
    )
    db.add(sim_prop)
    
    for i in range(25):
        street = random.choice(streets)
        number = random.randint(1, 150)
        tenant = random.choice(users).name if random.random() > 0.1 else "Vacant"
        
        status = "Occupied" if tenant != "Vacant" else "Vacant"
        risk = random.choice(["Low", "Low", "Low", "Medium", "High"]) if status == "Occupied" else "Low"
        
        # Random offset for clustering (approx 5km radius)
        lat_offset = (random.random() - 0.5) * 0.1
        long_offset = (random.random() - 0.5) * 0.1

        prop = Property(
            address=f"{number} {street}",
            tenant_name=tenant,
            status=status,
            risk_level=risk,
            lat=base_lat + lat_offset,
            long=base_long + long_offset
        )
        db.add(prop)
        properties.append(prop)
    db.commit()

    # 4. Add Tickets
    issues = [
        "Boiler making loud banging noise", "Damp patch on ceiling in bedroom", 
        "Front door lock sticking", "Radiator leaking in hallway", 
        "Window handle broken", "No hot water", "Mould growing behind wardrobe"
    ]
    
    for i in range(15):
        user = random.choice(users)
        issue = random.choice(issues)
        status = random.choice(["Open", "Open", "In Progress", "Resolved"])
        priority = "Emergency" if "water" in issue else "High" if "Mould" in issue else "Medium"
        category = "Damp & Mould" if "Mould" in issue or "Damp" in issue else "Plumbing" if "water" in issue or "leak" in issue else "General"
        
        from datetime import timedelta
        sla_due = datetime.utcnow() + timedelta(days=random.randint(1, 3))

        ticket = Ticket(
            user_id=user.id,
            title=issue,
            description=f"Tenant reported: {issue}. Please investigate.",
            status=status,
            priority=priority,
            category=category,
            created_at=datetime.utcnow(),
            sla_due=sla_due
        )
        db.add(ticket)
    
    db.commit()
    print("Database seeded successfully!")
    print(f"   - {len(users)} Users generated")
    print(f"   - {len(properties) + 1} Properties generated with Lat/Long coords")
    print("   - 15 Tickets generated")

if __name__ == "__main__":
    seed_data()
