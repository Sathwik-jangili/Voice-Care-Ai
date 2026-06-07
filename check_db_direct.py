import sqlite3

def check_db():
    try:
        conn = sqlite3.connect('voice_care.db')
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables: {tables}")
        
        if 'guide_searches' in tables:
            cursor.execute("SELECT count(*) FROM guide_searches")
            print(f"Guide Searches: {cursor.fetchone()[0]}")
            
            cursor.execute("SELECT topic, created_date FROM guide_searches ORDER BY created_date DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                print(f"Last Guide Search: {row}")
        else:
            print("guide_searches table MISSING")
            
        if 'navigator_queries' in tables:
            cursor.execute("SELECT count(*) FROM navigator_queries")
            print(f"Navigator Queries: {cursor.fetchone()[0]}")
            
            cursor.execute("SELECT query, created_date FROM navigator_queries ORDER BY created_date DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                print(f"Last Navigator Query: {row}")
        else:
            print("navigator_queries table MISSING")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
