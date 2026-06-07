from backend.database import SessionLocal, engine
from backend import models
from sqlalchemy import inspect, text

def check_tables():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables in DB: {tables}")
    
    required = ['guide_searches', 'navigator_queries']
    missing = [t for t in required if t not in tables]
    
    if missing:
        print(f"MISSING TABLES: {missing}")
    else:
        print("All required tables exist.")
        
    db = SessionLocal()
    try:
        guide_count = db.query(models.GuideSearch).count()
        nav_count = db.query(models.NavigatorQuery).count()
        print(f"Guide Searches: {guide_count}")
        print(f"Navigator Queries: {nav_count}")
        
        if guide_count > 0:
            last_guide = db.query(models.GuideSearch).order_by(models.GuideSearch.created_date.desc()).first()
            print(f"Last Guide Topic: {last_guide.topic}")
            
        if nav_count > 0:
            last_nav = db.query(models.NavigatorQuery).order_by(models.NavigatorQuery.created_date.desc()).first()
            print(f"Last Navigator Query: {last_nav.query}")
            
    except Exception as e:
        print(f"Error querying data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_tables()
