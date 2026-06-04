# Testing Guide for DevConnect Task Management Features

## Pre-Test Checklist

✅ Docker containers running (frontend on port 3000, backend on port 5000)
✅ MongoDB is initialized
✅ API proxy correctly configured for Docker environment

## Test Case 1: Task Update/Edit ✏️

### Steps:

1. Navigate to http://localhost:3000
2. Login with your credentials
3. Go to a project with existing tasks (create one if needed)
4. Click the **edit icon** (pencil) on any task card
5. Modify fields:
   - Title
   - Description
   - Priority
   - Status
   - Assigned user
   - Due date
6. Click **"✓ Update Task"** button
7. Verify toast notification shows "Task updated successfully"
8. Verify changes are reflected in the task card

### Expected Behavior:

- Modal opens with current task details pre-filled
- Form validation works
- Changes persist after closing modal
- Task card updates immediately

---

## Test Case 2: Adding Comments 💬

### Steps:

1. In any task card, click the **comment icon** (speech bubble with number)
2. Comments section expands
3. Type a comment in the input field
4. Press **Enter** or click the **send button** (→)
5. Verify comment appears in the comments list
6. Try adding another comment
7. Verify all comments show:
   - Author name
   - Comment text
   - Timestamp (relative time like "2 seconds ago")
   - Delete button (X icon)

### Expected Behavior:

- Comments load when section is opened
- New comments appear immediately
- Form clears after submission
- Delete buttons work (with confirmation)
- Timestamps update in real-time

---

## Test Case 3: Drag and Drop 🎯

### Setup:

Create multiple tasks with different statuses for testing

### Steps:

1. Go to the Task Board view
2. Locate a task in one column (e.g., "To Do")
3. **Drag** the task card to another column (e.g., "In Progress")
4. **Drop** it in the target column
5. Observe visual feedback:
   - Card becomes slightly transparent while dragging
   - Smooth drop animation
   - Card settles in new column
6. Verify toast shows "Task moved successfully"
7. Verify task status updated on card
8. Close and reopen page to confirm persistence

### Advanced Tests:

- Drag task multiple times between different columns
- Drag back to original column
- Try dragging to same column (should not update)
- Test with slow 3G network (open DevTools) to see optimistic updates

### Expected Behavior:

- Smooth drag with visual feedback
- Card dims while dragging (opacity 0.5)
- Slight rotation and scale effect during drag
- Instant status reflection in UI
- Backend update completes within 1-2 seconds
- Error recovery if backend fails (reverts to original position)

---

## Test Case 4: Responsive Design 📱

### Steps:

1. Open browser DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Test various screen sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
4. Verify:
   - Grid changes from 4 columns → 2 columns → 1 column
   - All buttons are touch-friendly
   - Modals fit the screen
   - Text is readable
   - No horizontal scrolling

---

## Test Case 5: Form Validation 📝

### Steps:

1. Click **"+ Add New Task"** button
2. Try submitting empty form
3. Verify error message: "⚠️ Task title is required"
4. Enter a task title
5. Try exceeding 200 characters
6. Verify character counter shows red alert
7. Test description field similarly (max 1000 chars)
8. Verify form validation works correctly

### Expected Behavior:

- Required fields are marked with \*
- Character counter shows current/max
- Validation happens on submit
- Error messages appear inline
- Submit button disabled while saving

---

## Test Case 6: UI Visual Check ✨

### Verify These Elements:

- [ ] Task board header looks clean and professional
- [ ] Column headers have proper colors (blue, amber, purple, green)
- [ ] Task cards have gradient borders
- [ ] Priority badges show correct emoji and colors
- [ ] Hover effects work smoothly
- [ ] Comments section expands/collapses smoothly
- [ ] Modal animations are smooth
- [ ] Loading spinner appears on form submission
- [ ] Toast notifications appear in correct position
- [ ] No visual bugs or layout shifts

---

## Test Case 7: Error Handling ⚠️

### Network Error Test:

1. Open DevTools (F12)
2. Go to Network tab
3. Create/Update a task
4. While request is pending, disable network (throttle to offline)
5. Verify error toast appears
6. Try again with network enabled
7. Verify task is created/updated successfully

### Validation Error Test:

1. Try to create a task without a title
2. Verify validation error appears
3. Try with special characters
4. Try with very long text
5. Verify all validations work

---

## Test Case 8: Performance Check ⚡

### Steps:

1. Create 20+ tasks in different columns
2. Try dragging tasks
3. Verify smooth performance (60fps)
4. Add comments to multiple tasks
5. Verify no lag when switching between tasks
6. Check browser DevTools Performance tab (should see smooth interactions)

---

## Troubleshooting Guide

### Issue: "Cannot POST /api/task" 500 Error

- Verify backend container is running: `docker ps`
- Check backend logs: `docker logs devconnect-backend`
- Restart containers: `docker compose down -v && docker compose up --build`

### Issue: Comments not persisting

- Check browser console for errors (F12 → Console tab)
- Verify MongoDB is running: `docker logs devconnect-mongodb`
- Check if task ID is valid in the URL

### Issue: Drag and drop not working

- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+R)
- Check if @dnd-kit library is imported correctly
- Check browser console for JS errors

### Issue: Modal stuck open

- Check if overlay click is working
- Try pressing Escape key
- Clear browser cache and reload

---

## Quick Test Checklist

```
Task Update:
✅ Edit button works
✅ Modal opens with pre-filled data
✅ All fields are editable
✅ Changes save correctly
✅ Toast shows success message

Comments:
✅ Comment section expands/collapses
✅ Can add new comments
✅ Can delete comments
✅ Timestamps display correctly
✅ Comment count updates

Drag & Drop:
✅ Can drag tasks between columns
✅ Visual feedback during drag
✅ Task status updates
✅ Toast shows success
✅ Changes persist on refresh

UI/UX:
✅ Professional modern design
✅ Responsive on mobile
✅ Smooth animations
✅ Clear visual hierarchy
✅ Good color contrast
```

---

## Support

If you encounter any issues:

1. Check browser developer console (F12)
2. Check backend logs: `docker logs devconnect-backend`
3. Check frontend logs: `docker logs devconnect-frontend`
4. Restart all services: `docker compose restart`
5. Report the error with screenshots and logs

---

**Happy Testing! 🚀**
