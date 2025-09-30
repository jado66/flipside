# IndexedDB Quick Reference

## 🔍 Debug in Console (Development Only)

Open the browser console and use these commands:

```javascript
// View cache statistics
await window.tricksCache.stats()

// Log detailed cache stats
await window.tricksCache.log()

// Check storage quota
await window.tricksCache.quota()

// Clear all cached data
await window.tricksCache.clear()

// Export cache as JSON file
await window.tricksCache.export()
```

## 🛠️ Chrome DevTools

**View Data:**
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Expand **Storage** → **IndexedDB** → **TrickipediaDB**
4. Click on **tricks** or **metadata** to view data

**Clear Data:**
1. Right-click on **TrickipediaDB**
2. Click **Delete database**

## 📊 Common Queries

### Get all tricks
```typescript
import { loadTricksFromIndexedDB } from "@/lib/indexeddb";
const tricks = await loadTricksFromIndexedDB();
```

### Get specific trick
```typescript
import { getTrickByIdFromIndexedDB } from "@/lib/indexeddb";
const trick = await getTrickByIdFromIndexedDB("trick-id");
```

### Get tricks by category
```typescript
import { getTricksByCategoryFromIndexedDB } from "@/lib/indexeddb";
const parkourTricks = await getTricksByCategoryFromIndexedDB("parkour");
```

### Get tricks by subcategory
```typescript
import { getTricksBySubcategoryFromIndexedDB } from "@/lib/indexeddb";
const flips = await getTricksBySubcategoryFromIndexedDB("flips");
```

### Clear cache
```typescript
import { clearTricksFromIndexedDB } from "@/lib/indexeddb";
await clearTricksFromIndexedDB();
```

## 🎯 Using the Provider

### Basic usage
```typescript
import { useTricks } from "@/contexts/tricks-provider";

function MyComponent() {
  const { tricks, loading, error } = useTricks();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{tricks.length} tricks loaded</div>;
}
```

### Get specific trick
```typescript
const { getTrickById } = useTricks();
const trick = getTrickById("some-id");
```

### Filter by category
```typescript
const { getTricksByCategory } = useTricks();
const parkourTricks = getTricksByCategory("parkour");
```

### Filter by subcategory
```typescript
const { getTricksBySubcategory } = useTricks();
const flips = getTricksBySubcategory("flips");
```

### Force refresh
```typescript
const { refetch } = useTricks();
await refetch();
```

## 🐛 Troubleshooting

### Cache not updating
```javascript
// Clear cache and refresh
await window.tricksCache.clear();
window.location.reload();
```

### Check if IndexedDB is working
```javascript
// Returns true if IndexedDB is supported
import { isIndexedDBSupported } from "@/lib/indexeddb";
console.log(isIndexedDBSupported());
```

### View storage usage
```javascript
await window.tricksCache.quota();
```

### Export data for inspection
```javascript
await window.tricksCache.export();
```

## 📈 Performance Monitoring

### Measure load time
```javascript
console.time("tricks-load");
const tricks = await loadTricksFromIndexedDB();
console.timeEnd("tricks-load");
// Typical: 5-20ms
```

### Check cache freshness
```javascript
import { getLastUpdatedFromIndexedDB } from "@/lib/indexeddb";
const lastUpdated = await getLastUpdatedFromIndexedDB();
console.log(`Last updated: ${lastUpdated}`);
```

## 🔒 Privacy & Storage

### Where is data stored?
- **Location**: Browser's IndexedDB (client-side only)
- **Scope**: Limited to your domain
- **Persistence**: Survives page refreshes, not shared between browsers

### How to clear data?
**Users can clear via:**
- Browser settings → Clear browsing data → Cookies and site data
- Your app's clear cache function
- DevTools (right-click database → Delete)

### Storage limits
| Browser | Typical Limit |
|---------|---------------|
| Chrome | ~60% of disk space |
| Firefox | ~50% of disk space |
| Safari | ~1GB |
| Mobile | 50MB - 500MB |

## ✅ Best Practices

1. **Always handle loading states**
   ```typescript
   const { tricks, loading } = useTricks();
   if (loading) return <Spinner />;
   ```

2. **Check for errors**
   ```typescript
   const { error } = useTricks();
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Use helper methods**
   ```typescript
   // Good
   const trick = getTrickById(id);
   
   // Avoid
   const trick = tricks.find(t => t.id === id);
   ```

4. **Trust the cache**
   ```typescript
   // Don't refetch unnecessarily
   // The provider auto-syncs in the background
   ```

5. **Clear cache when debugging**
   ```typescript
   // Clear before testing fresh data
   await window.tricksCache.clear();
   ```

## 📚 Resources

- Full docs: `TRICKS_PROVIDER_README.md`
- Implementation details: `INDEXEDDB_IMPLEMENTATION.md`
- Source: `lib/indexeddb/tricks-db.ts`
- Debug utils: `lib/indexeddb/debug.ts`
