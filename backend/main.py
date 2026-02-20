from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Use SQLite for local dev, Azure SQL for prod (via env var)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./prop_sense.db")

# --- Database Setup (SQLAlchemy) ---
# SQLAlchemy is the "Translator" - it lets us write Python code instead of raw SQL queries.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models ---
class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, index=True, nullable=True)
    sensor_id = Column(String, index=True)
    sensor_type = Column(String, index=True)
    payload = Column(String)  # JSON stringified data
    risk_level = Column(String)  # "Low", "Medium", "High"
    timestamp = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)

class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, index=True)
    tenant_name = Column(String)
    status = Column(String, default="Occupied")
    risk_level = Column(String, default="Low")
    lat = Column(Float, nullable=True) # Latitude
    long = Column(Float, nullable=True) # Longitude
    last_updated = Column(DateTime, default=datetime.utcnow)

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer) # For MVP simplified, just store ID. FK: ForeignKey("users.id")
    title = Column(String)
    description = Column(String)
    status = Column(String, default="Open") # Open, In Progress, Resolved
    priority = Column(String, default="Medium") # Low, Medium, High, Emergency
    category = Column(String, default="General") # Damp, Boiler, Electrical, ASB, Other
    created_at = Column(DateTime, default=datetime.utcnow)
    sla_due = Column(DateTime, nullable=True)

# Create tables
Base.metadata.create_all(bind=engine)

# --- Pydantic Models (Data Validation) ---
class SensorData(BaseModel):
    property_id: int | None = None
    sensor_id: str
    sensor_type: str
    payload: dict

class StatusResponse(BaseModel):
    status: str
    properties: list[dict]
    risk_level: str

class PropertyResponse(BaseModel):
    id: int
    address: str
    tenant_name: str
    status: str
    risk_level: str
    lat: float | None = None
    long: float | None = None
    last_updated: datetime
    class Config:
        orm_mode = True

class CreateTicket(BaseModel):
    user_id: int
    title: str
    user_id: int
    title: str
    description: str
    priority: str = "Medium"
    category: str = "General"

class TicketResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    description: str
    status: str
    priority: str
    category: str
    created_at: datetime
    sla_due: datetime | None = None
    
    # Enhanced Fields for UI
    tenant_name: str | None = None
    property_address: str | None = None
    property_risk_level: str | None = None

    class Config:
        orm_mode = True

class CreateUser(BaseModel):
    name: str
    email: str
    phone: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    class Config:
        orm_mode = True

# --- App & Logic ---
app = FastAPI(title="PropSense AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev to avoid any port mismatch issues
    allow_credentials=False, # Must be False if allow_origins=["*"] to prevent browser CORS errors
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_risk(sensor_type: str, payload: dict) -> str:
    """
    The 'Brain': Simple Rule-based AI for evaluating different sensor types.
    """
    if sensor_type == "environmental":
        temp = payload.get("temp", 20)
        humidity = payload.get("humidity", 50)
        co2 = payload.get("co2", 400)
        if humidity > 70 and temp < 18:
            return "High"  # Aggressive Mold Risk
        elif humidity > 60 or co2 > 1000:
            return "Medium"
        return "Low"
        
    elif sensor_type == "plumbing":
        leak = payload.get("leak_detected", False)
        pipe_temp = payload.get("pipe_temp", 15)
        if leak:
            return "High" # Active leak
        elif pipe_temp < 4:
            return "Medium" # Freezing risk
        return "Low"
        
    elif sensor_type == "boiler":
        pressure = payload.get("pressure", 1.5)
        error_code = payload.get("error_code")
        if error_code or pressure < 0.5 or pressure > 2.5:
            return "High" # Boiler failure imminent/active
        elif pressure < 1.0 or pressure > 2.0:
            return "Medium"
        return "Low"
        
    elif sensor_type == "communal":
        status = payload.get("status", "OK")
        battery = payload.get("battery_health", 100)
        if status != "OK":
            return "High" # Lift broken or door jammed
        elif battery < 20:
            return "Medium" # Maintenance needed soon
        return "Low"
        
    # Default fallback
    return "Low"

# --- Endpoints ---

@app.get("/properties", response_model=list[PropertyResponse])
def get_properties():
    db = SessionLocal()
    props = db.query(Property).all()
    db.close()
    return props

@app.get("/properties/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int):
    db = SessionLocal()
    prop = db.query(Property).filter(Property.id == property_id).first()
    db.close()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop

@app.get("/properties/{property_id}/sensors")
def get_property_sensors(property_id: int):
    """
    Returns 24h history of sensor data (Mocked for MVP, would query SensorReading in prod)
    """
    # Mock data generation
    data = []
    now = datetime.now()
    import random
    
    base_temp = 20.0
    base_humidity = 50.0
    
    from datetime import timedelta
    
    for i in range(24):
        time_point = now - timedelta(hours=23-i)
        data.append({
            "timestamp": time_point.isoformat(),
            "environmental": {
                "temp": base_temp + random.uniform(-2, 2),
                "humidity": base_humidity + random.uniform(-5, 10),
                "co2": 400 + random.uniform(0, 100)
            },
            "boiler": {
                "pressure": random.uniform(1.2, 1.8)
            }
        })
    return data

@app.get("/properties/{property_id}/timeline")
def get_property_timeline(property_id: int):
    """
    Returns combined feed of events (Mocked)
    """
    return [
        {"type": "alert", "message": "Humidity hit 74% -> HIGH RISK", "timestamp": str(datetime.now())},
        {"type": "ticket", "message": "Tenant reported 'damp smell'", "timestamp": str(datetime.now())},
    ]

@app.post("/sensor-data")
def ingest_data(data: SensorData, background_tasks: BackgroundTasks):
    """
    Receives JSON data from the Simulator (or IoT Hub).
    """
    risk = calculate_risk(data.sensor_type, data.payload)
    
    import json
    db = SessionLocal()
    reading = SensorReading(
        property_id=data.property_id,
        sensor_id=data.sensor_id,
        sensor_type=data.sensor_type,
        payload=json.dumps(data.payload), 
        risk_level=risk,
        timestamp=datetime.now()
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    db.close()
    
    return {"message": "Data received", "risk_evaluation": risk}

@app.get("/status", response_model=StatusResponse)
def get_status():
    """
    Used by the Mobile App and Dashboard to see the latest state.
    """
    db = SessionLocal()
    
    props = db.query(Property).all()
    # Mapping property_id to property data structure
    properties_dict = {
        p.id: {
            "property_id": p.id,
            "address": p.address,
            "tenant_name": p.tenant_name,
            "risk_level": "Low",
            "sensors": {}
        } for p in props
    }
    
    highest_risk = "Low"
    
    # In SQLite, we can just do a groupby/max or simple queries.
    # For simplicity MVP, let's just get the last 200 readings and find the latest per sensor_id.
    recent_readings = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).limit(200).all()
    
    import json
    for r in recent_readings:
        prop_id = r.property_id
        # Assign to property, or "Unassigned" (id: 0)
        if prop_id not in properties_dict:
            if 0 not in properties_dict:
                properties_dict[0] = {"property_id": 0, "address": "Unassigned Sensors", "tenant_name": "N/A", "risk_level": "Low", "sensors": {}}
            prop_id = 0
            
        prop_sensors = properties_dict[prop_id]["sensors"]
        if r.sensor_id not in prop_sensors:
            prop_sensors[r.sensor_id] = {
                "sensor_id": r.sensor_id,
                "payload": json.loads(r.payload) if r.payload else {},
                "timestamp": r.timestamp.isoformat(),
                "risk_level": r.risk_level,
                "type": r.sensor_type
            }
            if r.risk_level == "High":
                highest_risk = "High"
                properties_dict[prop_id]["risk_level"] = "High"
            elif r.risk_level == "Medium":
                if highest_risk != "High": highest_risk = "Medium"
                if properties_dict[prop_id]["risk_level"] != "High": properties_dict[prop_id]["risk_level"] = "Medium"

    db.close()

    # Convert sensor dictionaries into arrays for easier frontend rendering
    properties_list = list(properties_dict.values())
    for p in properties_list:
        p["sensors"] = list(p["sensors"].values())

    return {
        "status": "Online",
        "properties": properties_list,
        "risk_level": highest_risk
    }

# --- Ticket Endpoints ---
@app.post("/tickets", response_model=TicketResponse)
def create_ticket(ticket: CreateTicket):
    db = SessionLocal()
    db_ticket = Ticket(**ticket.dict(), status="Open", created_at=datetime.utcnow())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    db.close()
    return db_ticket

@app.get("/tickets", response_model=list[TicketResponse])
def get_tickets():
    db = SessionLocal()
    tickets = db.query(Ticket).all()
    
    # Enrich with mock data for MVP (since we don't have full relationships yet)
    # In prod, this would be a JOIN query
    enriched_tickets = []
    users = {u.id: u for u in db.query(User).all()}
    # Mock property association logic (User -> Property)
    # For MVP, we'll just grab a random property to show the UI
    import random
    props = db.query(Property).all()
    
    for t in tickets:
        # Mocking the JOIN
        mock_user = users.get(t.user_id)
        # Deterministic mock property based on User ID hash
        mock_prop = props[t.user_id % len(props)] if props else None
        
        t_dict = {
            "id": t.id,
            "user_id": t.user_id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "category": t.category,
            "created_at": t.created_at,
            "sla_due": t.sla_due,
            "tenant_name": mock_user.name if mock_user else "Unknown",
            "property_address": mock_prop.address if mock_prop else "Unknown",
            "property_risk_level": mock_prop.risk_level if mock_prop else "Low"
        }
        enriched_tickets.append(t_dict)
        
    db.close()
    return enriched_tickets

@app.patch("/tickets/{ticket_id}")
def update_ticket_status(ticket_id: int, status: str):
    db = SessionLocal()
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = status
    db.commit()
    db.close()
    return {"message": "Updated"}

class UpdateTicket(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    category: str | None = None
    status: str | None = None

@app.put("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, ticket_update: UpdateTicket):
    db = SessionLocal()
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        db.close()
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket_update.title: ticket.title = ticket_update.title
    if ticket_update.description: ticket.description = ticket_update.description
    if ticket_update.priority: ticket.priority = ticket_update.priority
    if ticket_update.category: ticket.category = ticket_update.category
    if ticket_update.status: ticket.status = ticket_update.status
    
    db.commit()
    db.refresh(ticket)
    
    # Enrich response (copy logic for now, ideally helper function)
    users = {u.id: u for u in db.query(User).all()}
    props = db.query(Property).all()
    mock_user = users.get(ticket.user_id)
    mock_prop = props[ticket.user_id % len(props)] if props else None
    
    t_dict = {
        "id": ticket.id,
        "user_id": ticket.user_id,
        "title": ticket.title,
        "description": ticket.description,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "created_at": ticket.created_at,
        "sla_due": ticket.sla_due,
        "tenant_name": mock_user.name if mock_user else "Unknown",
        "property_address": mock_prop.address if mock_prop else "Unknown",
        "property_risk_level": mock_prop.risk_level if mock_prop else "Low"
    }
    
    db.close()
    return t_dict

@app.delete("/tickets/{ticket_id}")
def delete_ticket(ticket_id: int):
    db = SessionLocal()
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        db.close()
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    db.close()
    return {"message": "Ticket deleted"}

# --- User Endpoints ---
@app.post("/users", response_model=UserResponse)
def create_user(user: CreateUser):
    db = SessionLocal()
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    db.close()
    return db_user

@app.get("/users", response_model=list[UserResponse])
def get_users():
    db = SessionLocal()
    users = db.query(User).all()
    db.close()
    return users

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    db.close()
    return {"message": "User deleted"}

# --- Analytics Endpoints (Phase 5) ---

@app.get("/analytics/kpis")
def get_analytics_kpis():
    return [
        {"label": "Occupancy Rate", "value": "97.2%", "target": ">95%", "status": "Good"},
        {"label": "Rent Collected", "value": "98.1%", "target": ">97%", "status": "Good"},
        {"label": "Repairs SLA", "value": "89%", "target": ">85%", "status": "Good"},
        {"label": "TSM Score", "value": "78/100", "target": ">75", "status": "Good"},
        {"label": "Complaints Resolved", "value": "91%", "target": ">90%", "status": "Good"},
        {"label": "Gas Safety", "value": "100%", "target": "100%", "status": "Good"},
    ]

@app.get("/analytics/risk-evolution")
def get_risk_evolution():
    # Mock data for last 30 days
    data = []
    import random
    from datetime import timedelta
    
    start_date = datetime.now() - timedelta(days=30)
    for i in range(30):
        date = (start_date + timedelta(days=i)).strftime("%b %d")
        high = random.randint(2, 8)
        medium = random.randint(10, 25)
        low = 100 - high - medium
        data.append({"date": date, "High": high, "Medium": medium, "Low": low})
    return data

@app.get("/analytics/ticket-trends")
def get_ticket_trends():
    # Mock data for last 6 months
    data = []
    months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
    import random
    
    for m in months:
        tenant = random.randint(10, 30)
        iot = random.randint(5, 20)
        staff = random.randint(2, 10)
        data.append({"month": m, "Tenant": tenant, "IoT": iot, "Staff": staff})
    return data

@app.get("/analytics/sla-performance")
def get_sla_performance():
    return [
        {"category": "Emergency (<24h)", "met": 92, "target": 90},
        {"category": "Urgent (<48h)", "met": 87, "target": 85},
        {"category": "Routine (<7d)", "met": 76, "target": 85},
    ]

@app.get("/analytics/roi")
def get_roi():
    return {
        "reactive_avoided": 14200,
        "total_savings": 27400,
        "vs_target_percent": 142
    }

@app.get("/analytics/property-health")
def get_property_health():
    return [
        {"grade": "A+ Excellent", "count": 12, "fill": "#10b981"}, # Emerald 500
        {"grade": "A Good", "count": 34, "fill": "#34d399"}, # Emerald 400
        {"grade": "B Satisfactory", "count": 18, "fill": "#fbbf24"}, # Amber 400
        {"grade": "C Needs Work", "count": 5, "fill": "#f87171"}, # Red 400
        {"grade": "D Critical", "count": 1, "fill": "#ef4444"}, # Red 500
    ]

@app.get("/analytics/tenant-load")
def get_tenant_load():
    return [
        {"name": "Sarah", "tickets": 42, "avg_time": 2.1, "performance": "Excellent"},
        {"name": "Mike", "tickets": 28, "avg_time": 4.3, "performance": "Good"},
        {"name": "Jamal", "tickets": 19, "avg_time": 6.1, "performance": "Warning"},
    ]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
