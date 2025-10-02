# View Students Dialog Feature

## Summary

Added a new read-only "View Students" dialog to view all enrolled students in a class without the ability to manage enrollments. This provides a cleaner way to see student lists without accidentally triggering management actions.

## Changes Made

### 1. New Component: `view-students-dialog.tsx`

Created a dedicated read-only dialog for viewing enrolled students:

**Features:**

- Shows all enrolled students with pagination (25 per page)
- Search functionality (by name, email, or phone)
- Displays class capacity with over-enrollment warnings
- Shows student contact information (email and phone with icons)
- Read-only badges showing "Enrolled" status
- No enrollment/unenrollment actions
- Clean "Close" button instead of "Done"

**Visual Consistency:**

- Uses same AlertTriangle icon for over-enrollment warnings
- Matches the styling of ManageStudentsDialog for familiarity
- Orange warning colors for over-enrolled classes
- Progress bar caps at 100% with orange styling

### 2. Updated `classes.tsx`

**New State:**

```typescript
const [viewOpen, setViewOpen] = useState(false);
const [viewClass, setViewClass] = useState<ClassItem | null>(null);
```

**New Functions:**

```typescript
const openView = (c: ClassItem) => {
  setViewClass(c);
  setViewOpen(true);
};

const currentViewClass = useMemo(() => {
  if (!viewClass) return null;
  return classes.find((c: any) => c.id === viewClass.id) || viewClass;
}, [classes, viewClass]);
```

**Dialog Integration:**

- Added `ViewStudentsDialog` component alongside `ManageStudentsDialog`
- Passes `currentViewClass` to keep dialog in sync with class updates
- Added `openView` prop to all view components

### 3. Updated `class-views.tsx`

#### GridView Changes:

- Added `openView` prop to interface
- Changed "View all X students" button to use `openView` instead of `openManage`
- "Manage" button still opens the manage dialog for enrollment actions

#### ListView Changes:

- Added `openView` prop to interface
- Made "+X more" text clickable with hover effects
- Clicking "+X more" opens the view dialog
- Added underline on hover for better UX

#### TableView Changes:

- Added `openView` prop to interface
- Split actions into two buttons:
  - **View** button (ghost variant, Users icon) - Opens read-only view
  - **Manage** button (outline variant, UserPlus icon) - Opens enrollment management
- Buttons are side-by-side in the Actions column

## User Experience Flow

### View Dialog (Read-Only)

1. User clicks:
   - "View all X students" button in Grid view
   - "+X more" link in List view
   - "View" button in Table view
2. View Students Dialog opens
3. User can:
   - See all enrolled students
   - Search/filter the list
   - View student contact information
   - See over-enrollment warnings
4. User clicks "Close" to dismiss

### Manage Dialog (Full Control)

1. User clicks:
   - "Manage" button in any view
2. Manage Students Dialog opens
3. User can:
   - Enroll new students
   - Unenroll existing students
   - Search all members
   - See over-enrollment warnings
4. User clicks "Done" when finished

## Design Decisions

### Why Two Dialogs?

1. **Separation of Concerns**: Viewing != Managing
2. **Safety**: Reduces accidental enrollment changes when just checking roster
3. **Performance**: View dialog is lighter (no member search/filtering for enrollment)
4. **UX**: Clear intent - "View" vs "Manage" actions

### Button Placement

- **Grid View**: Single "Manage" button remains (advanced users)
- **List View**: "+X more" is subtle and intuitive for quick viewing
- **Table View**: Two buttons provide clear choice between view/manage

### Styling Consistency

- Both dialogs use identical over-enrollment indicators
- Both use AlertTriangle icons (no emoji)
- Same color scheme (orange for warnings)
- Same layout structure for familiarity

## Benefits

1. **Improved UX**: Clear distinction between viewing and managing
2. **Safety**: Less chance of accidental enrollment changes
3. **Speed**: Quicker access to student list without full management UI
4. **Clarity**: Obvious which action you're performing
5. **Accessibility**: Proper button labels and semantic actions
