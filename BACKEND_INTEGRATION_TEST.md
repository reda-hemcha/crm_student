# 🧪 **Backend Integration Test Plan**

## ✅ **Frontend-Backend Integration Verification**

### **🎯 Test Scenarios**

#### **1. Education Data Loading**

```javascript
// Test: GET /api/classes/education-data
Expected Response:
{
  "success": true,
  "data": {
    "educationLevels": {
      "primary": "Primary School",
      "lower-secondary": "Lower Secondary (Collège)",
      "upper-secondary": "Upper Secondary (Lycée)"
    },
    "academicYears": {
      "primary": ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year"],
      "lower-secondary": ["7th Year", "8th Year", "9th Year"],
      "upper-secondary": ["10th Year", "11th Year", "12th Year"]
    },
    "levelOptions": [
      { "value": "primary", "label": "Primary School" },
      { "value": "lower-secondary", "label": "Lower Secondary (Collège)" },
      { "value": "upper-secondary", "label": "Upper Secondary (Lycée)" }
    ]
  }
}

Frontend Usage: ✅ Populates ClassModal education level options
```

#### **2. Academic Years by Level**

```javascript
// Test: GET /api/classes/academic-years/lower-secondary
Expected Response:
{
  "success": true,
  "data": {
    "level": "lower-secondary",
    "academicYears": [
      { "value": "7th Year", "label": "7th Year" },
      { "value": "8th Year", "label": "8th Year" },
      { "value": "9th Year", "label": "9th Year" }
    ]
  }
}

Frontend Usage: ✅ Updates year dropdown when education level changes
```

#### **3. Class Creation**

```javascript
// Test: POST /api/classes
Request Body:
{
  "name": "7th Year Advanced Math",
  "level": "lower-secondary",
  "year": "7th Year",
  "schoolId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "maxStudents": 30
}

Expected Response:
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "class": {
      "_id": "674d1234567890abcdef1234",
      "name": "7th Year Advanced Math",
      "level": "lower-secondary",
      "year": "7th Year",
      "schoolId": { "_id": "64f8a1b2c3d4e5f6a7b8c9d0", "name": "Si Reda School" },
      "maxStudents": 30,
      "currentStudents": 0,
      "availableSpots": 30,
      "isFull": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}

Frontend Usage: ✅ ClassModal form submission creates class with education level structure
```

#### **4. Enhanced Filtering**

```javascript
// Test: GET /api/classes?level=lower-secondary&year=7th Year&search=math
Expected: Returns only classes matching the education level, year, and search criteria

Frontend Usage: ✅ ClassesPage filters work with new education level parameters
```

### **🔍 **Manual Testing Checklist\*\*

#### **ClassModal Testing:**

- [ ] Open ClassModal - education levels load from API
- [ ] Select "Primary School" - years show 1st-6th Year
- [ ] Select "Lower Secondary" - years show 7th-9th Year
- [ ] Select "Upper Secondary" - years show 10th-12th Year
- [ ] Fill form and submit - creates class with proper structure
- [ ] Edit existing class - loads current education level and year

#### **ClassesPage Testing:**

- [ ] Education level filter populates from API
- [ ] Academic year filter shows all available years
- [ ] Filter by education level - results update correctly
- [ ] Filter by academic year - results update correctly
- [ ] Combined filters work together
- [ ] Clear filters resets all education level filters

#### **ClassesTable Testing:**

- [ ] Education level badges display with correct colors
- [ ] Academic year shows in class details
- [ ] Capacity information displays correctly
- [ ] All new fields render properly

### **⚠️ **Potential Issues to Watch\*\*

1. **API Response Format**: Ensure backend returns exactly the format expected by frontend
2. **Authentication Headers**: Verify all education data endpoints require proper auth
3. **Error Handling**: Test invalid education level/year combinations
4. **Loading States**: Verify loading indicators during API calls
5. **Cache Behavior**: Check if academic years cache correctly per level

### **🚀 **Quick Test Commands\*\*

```bash
# Start frontend
cd frontend && npm run dev

# Test in browser console:
# 1. Check education data loading
console.log('Testing education data...')

# 2. Open ClassModal and verify dropdowns populate

# 3. Create a test class and verify structure

# 4. Test filtering on ClassesPage
```

### **📊 **Expected Data Flow\*\*

```
1. User opens ClassModal
   → Frontend calls GET /api/classes/education-data
   → Education levels populate

2. User selects education level
   → Frontend calls GET /api/classes/academic-years/:level
   → Academic years populate for that level

3. User submits form
   → Frontend sends POST /api/classes with education structure
   → Backend validates and creates class

4. User filters classes
   → Frontend calls GET /api/classes?level=X&year=Y
   → Filtered results display
```

## ✅ **Integration Status: READY FOR TESTING**

The frontend has been fully updated to work with your enhanced backend API. All components are aligned with your new class structure and validation rules.
