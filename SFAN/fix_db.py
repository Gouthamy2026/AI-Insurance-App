import sqlite3, datetime

conn = sqlite3.connect('sfan.db')
cur = conn.cursor()

# Update currency to Rupees
cur.execute("UPDATE policies SET coverage_amount = REPLACE(coverage_amount, '$', '₹'), premium = REPLACE(premium, '$', '₹')")

now = datetime.datetime.utcnow()

# Update Activity Logs with distinct times
cur.execute("UPDATE activity_logs SET created_at = ? WHERE description LIKE '%Claim Outcome%'", (now - datetime.timedelta(days=2),))
cur.execute("UPDATE activity_logs SET created_at = ? WHERE description LIKE '%Care Eligibility%'", (now - datetime.timedelta(days=1, hours=5),))
cur.execute("UPDATE activity_logs SET created_at = ? WHERE description LIKE '%Profile Updated%'", (now - datetime.timedelta(hours=2),))
cur.execute("UPDATE activity_logs SET created_at = ? WHERE description LIKE '%Viewed My Policies%'", (now - datetime.timedelta(minutes=15),))

# Update Notifications with distinct times
cur.execute("UPDATE notifications SET created_at = ? WHERE id = 1", (now - datetime.timedelta(days=3),))
cur.execute("UPDATE notifications SET created_at = ? WHERE id = 2", (now - datetime.timedelta(days=1),))
cur.execute("UPDATE notifications SET created_at = ? WHERE id = 3", (now - datetime.timedelta(hours=4),))

conn.commit()
conn.close()
print("Database updated successfully.")
