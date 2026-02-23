> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 32.9 — Quick Start Testing Guide

## 🚀 Getting Started

### Step 1: Start the Development Server
```powershell
cd c:\JS\bridgeflow
pnpm run web:dev
```

**Expected Output:**
```
✅ Initial build succeeded — bundled to C:\JS\bridgeflow\web\dist
🚀 Dev server running at http://localhost:3000
```

### Step 2: Open Bridge Assembly Page
Navigate to: `http://localhost:3000/canvas-assembly`

### Step 3: Load Test Data
The page will auto-load trading partners from the API. If the TP list is empty:
1. Seed test data: `pnpm run db:seed`
2. Refresh the page

---

## 🧪 Testing the Three Fixes

### TEST #1: Canvas Panning (BizTalk-Style)

#### Setup
1. Open Browser DevTools Console (F12 → Console tab)
2. Create some components on canvas:
   - Drag "Trading Partner" from left palette to canvas
   - Drag "FTP" connector
   - Drag another "Trading Partner"
   - This creates a larger canvas area

#### Test Middle Mouse Button
1. **Position**: Move mouse over canvas center
2. **Action**: Press middle mouse button (scroll wheel button)
3. **Expected**: Cursor changes from pointer to `grab`
4. **Drag**: While holding middle button, drag the mouse
5. **Expected**: Canvas moves smoothly, components move with it
6. **Release**: Release middle button
7. **Expected**: Cursor returns to normal

#### Test Ctrl + Left Click
1. **Position**: Move mouse over empty canvas area (not on component)
2. **Hold**: Press and hold Ctrl key
3. **Click**: Left-click mouse button (while holding Ctrl)
4. **Expected**: Cursor changes to `grabbing`
5. **Drag**: Drag mouse while holding Ctrl + left button
6. **Expected**: Canvas pans smoothly
7. **Release**: Release mouse button
8. **Expected**: Normal cursor returns

#### Test Double-Click Reset
1. **Pan**: Use any method above to pan the canvas away from origin
2. **Double-Click**: Double-click on canvas (not on component)
3. **Expected**: Canvas snaps back to origin (0, 0)
4. **Verify**: Components are in original positions

#### Verify Non-Interference
1. **Drag Component**: Left-click on component → drag normally
2. **Expected**: Component moves with mouse, not entire canvas
3. **Drag Palette Item**: Left-click TP in left palette → drag to canvas
4. **Expected**: Palette item creates new component, not canvas pan

---

### TEST #2: Sidebar Slide-Off Animation

#### Setup
1. Open page: `http://localhost:3000/canvas-assembly`
2. DevTools open (F12) for console visibility
3. Check both sidebars are visible

#### Test Left Sidebar Collapse
1. **Locate**: Find left sidebar (Component Palette)
2. **Find Button**: Look for toggle arrow `◀` at top-right of sidebar header
3. **Click**: Click the arrow button
4. **Animation**: Sidebar should smoothly slide LEFT off-screen (0.3s animation)
5. **Arrow Visible**: After collapse, arrow `→` should be visible outside canvas edge
6. **Canvas**: Canvas should expand to full width (minus right sidebar)

#### Test Left Sidebar Expand
1. **Locate**: Find the floating arrow `→` outside left canvas edge
2. **Click**: Click the arrow
3. **Animation**: Sidebar should smoothly slide back RIGHT into view (0.3s)
4. **Header**: Sidebar title and content should be visible again
5. **Arrow**: Arrow changes back to `◀`

#### Test Right Sidebar Collapse
1. **Locate**: Find right sidebar (Configuration)
2. **Find Button**: Look for toggle arrow `▶` at top-left of sidebar header
3. **Click**: Click the arrow
4. **Animation**: Sidebar should smoothly slide RIGHT off-screen
5. **Arrow Visible**: Arrow `◀` visible outside right canvas edge
6. **Canvas**: Canvas expands left

#### Test Right Sidebar Expand
1. **Locate**: Find floating arrow `◀` outside right edge
2. **Click**: Arrow
3. **Animation**: Sidebar slides back LEFT
4. **Arrow Changes**: Back to `▶`

#### Test Collapse Both Sidebars
1. **Collapse Left**: Click left toggle
2. **Collapse Right**: Click right toggle
3. **Expected**: Full-screen canvas with only two small arrow buttons visible
4. **Expand**: Click each arrow to restore sidebars

#### Verify Connection Updates
1. **Create Bridge**: Add 2+ components with connections
2. **Collapse Sidebar**: Click toggle
3. **Console**: Check DevTools console (F12 → Console)
4. **Expected**: No errors, connections should still render correctly
5. **Expand**: Restore sidebar
6. **Expected**: Layout correct, connections still valid

---

### TEST #3: Trading Partner Loading

#### Verify TP Count Display
1. **Open**: `http://localhost:3000/canvas-assembly`
2. **Wait**: Page loads (2-3 seconds for API sync)
3. **Locate**: Left sidebar → "Trading Partners" folder
4. **Check**: Display should show `(n)` where n > 0
   - Example: `(4)` or `(7)`
5. **If 0**: 
   - Check browser console for errors (F12 → Console)
   - Verify API is running: `http://localhost:4000/api/trading-partners`
   - Check database seeding: `pnpm run db:seed`

#### Verify TP List Populated
1. **Open**: Trading Partners folder (should show `(n)` items)
2. **Look For**: Draggable TP items with:
   - Icon (e.g., 🏢)
   - Name (e.g., "Acme Corp")
   - Status indicator (● color-coded)
3. **Count**: Verify number of items matches count `(n)`

#### Test TP Dragging
1. **Click & Hold**: On a TP item in palette
2. **Drag**: Move to canvas area
3. **Expected**: Component appears on canvas with TP branding
4. **Release**: Component locks to grid position
5. **Verify**: Component appears in canvas, not in palette

#### Test TP Add
1. **Locate**: "+ Add Trading Partner" button in Trading Partners folder
2. **Click**: Button
3. **Navigation**: Should navigate to `/create-tp` page
4. **Create**: Fill form and create a test TP
5. **Return**: After creation, should return to canvas-assembly
6. **Verify**: New TP appears in palette
7. **Count**: Count should increment

#### Test Auto-Sync on Navigation
1. **Add TP**: From `/create-tp` route
2. **Return**: Navigate back to canvas
3. **Expected**: New TP in palette without page refresh
4. **Count**: Updated to include new TP

---

## 🔍 Debugging Tips

### Canvas Panning Not Working
1. **Check Console**: F12 → Console (should be clean)
2. **Verify Viewport**: Inspect element → canvas-viewport (should exist)
3. **Mouse Button**: Ensure middle mouse/Ctrl+click works in your browser
4. **Browser Test**: Try different browser (Chrome, Firefox, etc.)

### Sidebar Animation Choppy
1. **DevTools Performance**: F12 → Performance tab
2. **Record**: Record sidebar collapse
3. **Analyze**: Look for layout thrashing or repaints
4. **CPU**: High CPU usage? Check for loops in setupPanelToggles

### TP Count Shows Zero
1. **API Status**: Check `http://localhost:4000/api/health`
2. **API Route**: Verify `/api/trading-partners` returns data
3. **Store Debug**: In console: `console.log(store.partners)`
4. **API Fetch**: Check browser Network tab (F12 → Network) for `/trading-partners` request
5. **Database**: Run `pnpm run db:seed` to populate test data

### No Toggle Arrows Visible When Collapsed
1. **CSS**: Check DevTools → Styles (F12 → Elements → Styles)
2. **z-index**: Should be `41` (visible on top)
3. **Position**: Should be `absolute` with `right: -35px` or `left: -35px`
4. **Visibility**: Check `opacity: 1` and `pointer-events: auto`

---

## 📊 Expected Performance

| Operation | Time | Expected |
|-----------|------|----------|
| Page Load | 1-2s | Trading partners loaded from API |
| Canvas Pan | Real-time | Smooth 60 FPS (GPU-accelerated) |
| Sidebar Animation | 0.3s | Smooth easing |
| TP Palette Render | <100ms | All TPs visible immediately |

---

## ✅ Acceptance Criteria

- [x] Canvas pans smoothly with middle mouse / Ctrl+click
- [x] Double-click resets pan to origin
- [x] Sidebars slide off-canvas with visible arrows
- [x] Canvas expands to fill freed space
- [x] TP count > 0 when page loads
- [x] TP items draggable to canvas
- [x] No console errors
- [x] No layout thrashing or performance degradation

---

## 📝 Notes

- **First Load**: TP API call takes 1-2 seconds. Count will update when response arrives.
- **Hot Reload**: Changes to assembly.js or CSS auto-reload in dev mode
- **Local Storage**: TP list cached; clear if stale: DevTools → Application → Local Storage → Clear
- **Mobile**: Panning works on touch devices with middle button emulation (varies by browser)

---

## 🆘 Need Help?

If tests fail:
1. Check console (F12 → Console) for JavaScript errors
2. Check Network tab (F12 → Network) for API failures
3. Verify database is seeded: `pnpm run db:seed`
4. Restart dev server: `pnpm run web:dev`
5. Clear browser cache: Ctrl+Shift+Delete

---

**Last Updated:** January 2026
**Phase:** 32.9 — Enterprise UX Polish

