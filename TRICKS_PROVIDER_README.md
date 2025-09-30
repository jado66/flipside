# Tricks Provider

## Overview
The `TricksProvider` is a centralized data management solution for all tricks in the application. It implements **IndexedDB** caching and in-memory storage to provide instant data access across the entire app.

## Features

### 🚀 Instant Loading
- Tricks load from IndexedDB immediately on mount
- No waiting for database queries - users see data instantly
- Background sync updates data if changed

### 💾 IndexedDB Storage
- **No Size Limits**: Unlike localStorage (5-10MB), IndexedDB can store large datasets
- **Structured Data**: Optimized for complex objects like tricks
- **Indexed Queries**: Fast lookups by ID, category, or subcategory
- **Async Operations**: Non-blocking I/O for better performance
- **Automatic Fallback**: Gracefully handles browsers without IndexedDB support

### 🔍 Helper Methods
The provider includes utility methods for common operations:

```typescript
const { 
  tricks,              // All tricks array
  loading,             // Loading state
  error,               // Error state
  refetch,             // Manually refetch data
  getTrickById,        // Get a single trick by ID
  getTricksByCategory, // Get all tricks in a category
  getTricksBySubcategory // Get all tricks in a subcategory
} = useTricks();
```

## Usage

### Basic Usage
```typescript
import { useTricks } from "@/contexts/tricks-provider";

function MyComponent() {
  const { tricks, loading, error } = useTricks();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tricks.map(trick => (
        <div key={trick.id}>{trick.name}</div>
      ))}
    </div>
  );
}
```

### Get Specific Trick
```typescript
const { getTrickById } = useTricks();
const trick = getTrickById("trick-id-123");
```

### Get Tricks by Category
```typescript
const { getTricksByCategory } = useTricks();
const parkourTricks = getTricksByCategory("parkour");
```

### Get Tricks by Subcategory
```typescript
const { getTricksBySubcategory } = useTricks();
const flipTricks = getTricksBySubcategory("flips");
```

### Manual Refetch
```typescript
const { refetch } = useTricks();
await refetch(); // Force refresh from database
```

## Storage Implementation

### IndexedDB Structure
The app uses IndexedDB with the following schema:

**Database**: `TrickipediaDB`

**Stores**:
1. **tricks** - Main tricks data
   - Key Path: `id`
   - Indexes:
     - `slug` (unique) - For URL lookups
     - `category` - For filtering by master category
     - `subcategory` - For filtering by subcategory

2. **metadata** - Tracking information
   - Key Path: `key`
   - Stores: `last_updated` timestamp

### Why IndexedDB?

| Feature | localStorage | IndexedDB |
|---------|-------------|-----------|
| **Size Limit** | ~5-10MB | Hundreds of MB to GBs |
| **Data Type** | Strings only | Structured objects |
| **Performance** | Synchronous (blocking) | Asynchronous (non-blocking) |
| **Indexing** | None | Multiple indexes |
| **Queries** | Manual filtering | Indexed lookups |
| **Best For** | Simple key-value | Complex data structures |

### Storage Keys
IndexedDB stores are accessed via:
- `tricks` - All tricks data with indexes
- `metadata.last_updated` - Last update timestamp

## Data Structure
Each trick includes:
- `id` - Unique identifier
- `name` - Trick name
- `slug` - URL-friendly slug
- `description` - Trick description
- `difficulty_level` - Difficulty rating
- `prerequisite_ids` - Array of prerequisite trick IDs
- `subcategory` - Subcategory info with master category

## Benefits

### Performance
- **Instant Load**: No database round-trip on initial render
- **Single Fetch**: Data loaded once and shared across all components
- **Optimized Re-renders**: Only updates when data actually changes

### Developer Experience
- **Type-Safe**: Full TypeScript support
- **Easy to Use**: Simple hook-based API
- **Helper Methods**: Common operations built-in
- **Centralized**: One source of truth for all tricks

### User Experience
- **Fast**: Instant data display from cache
- **Reliable**: Falls back to cached data on errors
- **Seamless**: Background updates don't disrupt UI

## Implementation Details

### Provider Hierarchy
The TricksProvider should be placed in the provider tree where it can access necessary dependencies:

```tsx
<UserProvider>
  <CategoriesProvider>
    <TricksProvider>
      <UserProgressProvider>
        {/* Your app */}
      </UserProgressProvider>
    </TricksProvider>
  </CategoriesProvider>
</UserProvider>
```

### Error Handling
- Preserves cached data on fetch errors
- Handles abort signals gracefully
- Provides clear error messages via context
- Gracefully falls back if IndexedDB is unavailable

### Cleanup
- Aborts in-flight requests on unmount
- Prevents memory leaks
- Handles component lifecycle properly
- Automatically closes database connections

## Advanced Usage

### Direct IndexedDB Access
For advanced use cases, you can access IndexedDB utilities directly:

```typescript
import {
  loadTricksFromIndexedDB,
  saveTricksToIndexedDB,
  getTrickByIdFromIndexedDB,
  getTricksByCategoryFromIndexedDB,
  clearTricksFromIndexedDB,
} from "@/lib/indexeddb/tricks-db";

// Load tricks directly
const tricks = await loadTricksFromIndexedDB();

// Get a specific trick
const trick = await getTrickByIdFromIndexedDB("trick-id");

// Get tricks by category (uses index for fast lookup)
const parkourTricks = await getTricksByCategoryFromIndexedDB("parkour");

// Clear all cached data
await clearTricksFromIndexedDB();
```

### Browser Compatibility
IndexedDB is supported in all modern browsers:
- ✅ Chrome/Edge 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ iOS Safari 10+
- ✅ Android Browser 4.4+

The provider automatically detects support and handles fallbacks.

## Migration Guide

### Before (Old Approach)
```typescript
function MyComponent() {
  const [tricks, setTricks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTricks() {
      setLoading(true);
      const data = await getAllTricksBasic();
      setTricks(data);
      setLoading(false);
    }
    fetchTricks();
  }, []);
  
  // Use tricks...
}
```

### After (New Approach)
```typescript
function MyComponent() {
  const { tricks, loading } = useTricks();
  
  // Use tricks - that's it!
}
```

## Performance Comparison

| Metric | Old Approach | localStorage | IndexedDB (Current) |
|--------|-------------|--------------|---------------------|
| **Initial Load** | 500-2000ms | ~10-50ms | ~5-20ms |
| **Storage Limit** | N/A | 5-10MB | 50MB-250MB+ |
| **Re-renders** | Every component | Once globally | Once globally |
| **Network Requests** | Per component | Once per session | Once per session |
| **Memory Usage** | Duplicated data | Shared reference | Shared reference |
| **Query Speed** | N/A | Linear scan | Indexed lookup |
| **Blocking UI** | N/A | Yes (sync) | No (async) |

## Best Practices

1. **Don't Fetch in Components**: Use `useTricks()` instead of fetching manually
2. **Use Helper Methods**: Leverage `getTrickById` etc. instead of filtering manually
3. **Trust the Cache**: Don't call `refetch()` unless necessary
4. **Handle Loading States**: Always check `loading` before rendering
5. **Check for Errors**: Display error messages when they occur
6. **IndexedDB Limits**: Be aware that mobile browsers may have storage quotas
7. **Clear Old Data**: Consider implementing cache expiration for stale data

## Debugging

### Check IndexedDB in DevTools
1. Open Chrome DevTools
2. Go to **Application** tab
3. Expand **IndexedDB** → **TrickipediaDB**
4. View **tricks** and **metadata** stores

### Clear Cache
```typescript
import { clearTricksFromIndexedDB } from "@/lib/indexeddb/tricks-db";

// Clear all cached tricks
await clearTricksFromIndexedDB();
```

### Monitor Storage Usage
```typescript
// Check how much storage is used (Chrome only)
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
}
```

## Future Enhancements

Potential improvements:
- [ ] Add cache expiration (e.g., 24 hours)
- [ ] Implement optimistic updates for trick edits
- [ ] Add filtering/sorting helpers
- [ ] Support for real-time updates via Supabase subscriptions
- [ ] Paginated loading for large datasets
- [ ] Prefetching related tricks
- [ ] Compression for even faster loads
- [ ] Service Worker integration for offline support
- [ ] Background sync for stale data updates
- [ ] Migration utilities for schema changes

## Troubleshooting

### "QuotaExceededError"
**Problem**: IndexedDB storage quota exceeded  
**Solution**: Clear old data or implement automatic cleanup
```typescript
await clearTricksFromIndexedDB();
```

### Data Not Updating
**Problem**: Cached data showing instead of fresh data  
**Solution**: Use refetch to force update
```typescript
const { refetch } = useTricks();
await refetch();
```

### IndexedDB Not Available
**Problem**: Browser doesn't support IndexedDB  
**Solution**: Provider automatically handles this, but data won't persist between sessions

### Slow Initial Load
**Problem**: First load is slow with no cache  
**Solution**: This is expected - subsequent loads will be instant from IndexedDB

## Related Providers

- `CategoriesProvider` - Manages master categories
- `UserProgressProvider` - Tracks user's learned tricks
- `UserProvider` - Manages user authentication and profile
