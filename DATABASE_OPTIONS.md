# FloCafe Database Options

## Current Database: SQLite

FloCafe currently uses **SQLite** via the `better-sqlite3` library. This is a file-based, embedded database.

### ✅ Why SQLite is Used (Default)

1. **No server required** - Just a file (flo.db)
2. **Zero configuration** - Works out of the box
3. **Fast for single location** - Perfect for a single restaurant/cafe
4. **Offline-first** - Works without internet
5. **Easy backup** - Just copy the .db file
6. **Reliable** - Battle-tested, used by millions of apps
7. **No licensing costs** - Free and open source

### 📊 Current Database Location

```
flo.db                  # Main database file (4 KB - 100+ MB depending on data)
flo.db-wal             # Write-Ahead Log (temporary, for transactions)
flo.db-shm             # Shared memory file (temporary)
backups/               # Automatic backups folder
```

---

## Option 1: Use a Different SQLite File Location

**Easiest option** - Still SQLite, just different location.

### How to Change SQLite Location

**Method 1: Environment Variable**
```powershell
# Set custom database path
$env:FLO_DB_PATH = "D:\FloCafe\data\my-cafe.db"
node dev-server.js
```

**Method 2: Modify db.ts** (around line 20-30)
```typescript
// Change this line in main/db.ts:
const dbPath = path.join(app.getPath('userData'), 'flo.db');

// To this:
const dbPath = 'D:\\FloCafe\\data\\my-cafe.db';  // Your custom path
```

### Use Cases
- Store database on external drive
- Network drive for backups
- Separate data from application

---

## Option 2: PostgreSQL (Requires Major Changes)

**⚠️ Not officially supported** - Would require significant code changes.

### Why You Might Want PostgreSQL
- Multiple locations accessing same database
- Centralized data management
- Better for high concurrent access
- Advanced querying and reporting
- Industry standard for web apps

### What Would Need to Change
1. Replace `better-sqlite3` with `pg` (PostgreSQL driver)
2. Rewrite all SQL queries (SQLite → PostgreSQL syntax differences)
3. Change migrations system
4. Update schema creation
5. Handle connection pooling
6. Set up PostgreSQL server

**Effort Required**: 40-80 hours of development work
**Risk**: High (would break many features)

### PostgreSQL Migration Complexity

| Component | Complexity | Notes |
|-----------|------------|-------|
| Schema creation | High | Different data types |
| Migrations | High | Different SQL syntax |
| Queries | High | 200+ queries to update |
| Transactions | Medium | Different transaction handling |
| Full-text search | Medium | Different syntax |
| JSON handling | Medium | Different operators |
| Date/time | Medium | Different functions |

---

## Option 3: MySQL/MariaDB (Requires Major Changes)

Similar to PostgreSQL - would require extensive code changes.

### Challenges
- Replace better-sqlite3 with mysql2
- Rewrite all queries
- Handle connection management
- Different AUTO_INCREMENT behavior
- Different DATETIME handling

**Effort Required**: 40-80 hours
**Risk**: High

---

## Option 4: Multiple SQLite Files (Advanced)

Keep SQLite but use multiple files for different purposes.

### Example Structure
```
databases/
  ├── main.db          # Orders, bills, customers
  ├── menu.db          # Products, categories
  ├── settings.db      # Configuration
  └── reports.db       # Historical data, analytics
```

### Use Cases
- Separate read-heavy data (reports) from transactional data
- Different backup schedules per database
- Easier to share specific data

### Implementation
Requires modifying db.ts to:
1. Open multiple database connections
2. Route queries to appropriate database
3. Handle cross-database queries

**Effort Required**: 8-16 hours
**Risk**: Medium

---

## Option 5: Remote SQLite (Network Share)

Store the SQLite file on a network drive or NAS.

### ⚠️ Important Warnings

**DO NOT** do this if:
- Multiple devices will access simultaneously
- Network has any latency
- You need high reliability

**Why It's Risky**:
- SQLite doesn't handle network files well
- Risk of database corruption
- Slow performance
- Lock conflicts

### When It Might Work
- Single terminal accessing database
- Fast, reliable local network (Gigabit LAN)
- Regular backups
- Willing to accept risks

### Setup
```powershell
# Map network drive
net use Z: \\server\share\flocafe

# Point database to network location
$env:FLO_DB_PATH = "Z:\flo.db"
```

---

## Option 6: Hybrid Approach (SQLite + Cloud Sync)

Keep SQLite locally but sync to cloud/central database.

### FloCafe Already Has This!

Check `main/services/cloud-sync.ts` - there's built-in cloud sync functionality!

### How It Works
```
Local Terminal (SQLite) 
    ↓ 
Cloud Sync Service 
    ↓ 
Central Server (PostgreSQL/MySQL)
    ↓
Other Terminals / Mobile App / Reports
```

### Benefits
- ✅ Fast local performance
- ✅ Offline capability
- ✅ Multi-location support
- ✅ Centralized reporting
- ✅ Mobile app integration

### Configuration
In Settings table:
```sql
cloud_sync_enabled = '1'
cloud_server_url = 'https://your-server.com'
cloud_api_key = 'your-key'
```

---

## Recommendations by Use Case

### 🏪 Single Cafe/Restaurant
**Recommendation**: Keep SQLite (default)
- ✅ Fast, reliable, simple
- ✅ No additional setup
- ✅ Works offline
- ✅ Easy backups

### 🏢 Multiple Locations
**Recommendation**: SQLite + Cloud Sync
- ✅ Each location has local SQLite
- ✅ Sync to central server for reporting
- ✅ Built-in feature (already coded!)
- ✅ Best of both worlds

### 🌐 Web-Based POS (Future)
**Recommendation**: Migrate to PostgreSQL
- ✅ Better for web deployment
- ✅ Concurrent access
- ✅ Scalability
- ⚠️ Requires code rewrite

### 💾 Backup/Archive Purposes
**Recommendation**: External SQLite file
- ✅ Simple file copy
- ✅ Version control friendly
- ✅ Easy to restore
- ✅ No code changes needed

---

## How to Change Database Location (Quick Guide)

### Windows
```powershell
# Edit main/db.ts line ~25:
const dbPath = 'C:\\FloCafe\\Data\\flo.db';

# Or use environment variable:
$env:FLO_DB_PATH = "C:\FloCafe\Data\flo.db"
node dev-server.js
```

### Make Location Configurable
Add to main/db.ts (after imports):
```typescript
function getDbPath(): string {
  // Check environment variable first
  if (process.env.FLO_DB_PATH) {
    return process.env.FLO_DB_PATH;
  }
  
  // Default to userData folder
  return path.join(app.getPath('userData'), 'flo.db');
}

// Then use:
const dbPath = getDbPath();
```

---

## ⚠️ Important Considerations

### Before Changing Database System

1. **Backup Current Data**
   ```powershell
   Copy-Item flo.db backups/flo-$(Get-Date -Format 'yyyy-MM-dd').db
   ```

2. **Test Thoroughly**
   - Test all operations: orders, payments, reports
   - Test with realistic data volume
   - Test during peak hours

3. **Have Rollback Plan**
   - Keep old database file
   - Document configuration changes
   - Test restore procedure

4. **Consider Support**
   - SQLite = well-tested, community support
   - Custom solution = you maintain it

---

## Summary

| Option | Effort | Risk | Best For |
|--------|--------|------|----------|
| **Keep SQLite** | None | None | Single location ✅ |
| **Different SQLite Location** | 1 hour | Low | Storage preferences |
| **SQLite + Cloud Sync** | 2-4 hours | Low | Multiple locations ✅ |
| **PostgreSQL** | 40-80 hours | High | Future web version |
| **MySQL** | 40-80 hours | High | Future web version |
| **Network SQLite** | 1 hour | High | ⚠️ Not recommended |

---

## My Recommendation for Kenya Cafe

**Stay with SQLite** for now because:

1. ✅ You're a single location
2. ✅ It's already working
3. ✅ Fast and reliable
4. ✅ Easy to backup
5. ✅ No server costs
6. ✅ Works offline (Kenya power/internet outages)

**Future Option**: When you grow to multiple branches, use the **built-in cloud sync** feature to:
- Keep each branch with local SQLite (fast, offline-capable)
- Sync to central server for consolidated reporting
- Best of both worlds!

---

**Need to change database location?** Let me know and I'll help you configure it!
