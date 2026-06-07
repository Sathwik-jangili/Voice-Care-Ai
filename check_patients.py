import sqlite3

conn = sqlite3.connect('voice_care.db')
c = conn.cursor()

try:
    c.execute('SELECT COUNT(*) FROM patients')
    count = c.fetchone()[0]
    print(f'Patients in database: {count}')
    
    if count > 0:
        c.execute('SELECT id, name FROM patients LIMIT 5')
        patients = c.fetchall()
        print('\nSample patients:')
        for p in patients:
            print(f'  - {p[1]} (ID: {p[0]})')
    else:
        print('\nNo patients found in database!')
        
except Exception as e:
    print(f'Error: {e}')

conn.close()

