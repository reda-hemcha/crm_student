# 🔐 Authentication Debug Guide

## 🚨 **Problem: 401 Unauthorized Error**

The error `POST /api/students/validate-csv 401 Unauthorized` indicates an authentication issue. Here's how to fix it:

## 🔍 **Debug Steps**

### **Step 1: Check Authentication Status**

Open browser console and run:

```javascript
// Check if token exists
console.log("Auth Token:", localStorage.getItem("authToken"));
console.log("User Data:", localStorage.getItem("user"));

// Check if user is logged in
const user = JSON.parse(localStorage.getItem("user") || "null");
console.log("User Role:", user?.role);
console.log("User ID:", user?.id);
```

### **Step 2: Verify Token Format**

The token should look like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ4MDdiMGFhMDNlYmZlMDczMjU3OTgiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MzU0NzQ0MzIsImV4cCI6MTczNTU2MDgzMn0.example_signature
```

### **Step 3: Test Token Validity**

Run this in console to test if token is valid:

```javascript
// Test API call with current token
fetch("/api/auth/verify", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    "ngrok-skip-browser-warning": "true",
  },
})
  .then((response) => {
    console.log("Token Status:", response.status);
    if (response.status === 200) {
      console.log("✅ Token is valid");
    } else {
      console.log("❌ Token is invalid");
    }
  })
  .catch((error) => console.log("❌ Token test failed:", error));
```

## 🛠️ **Solutions**

### **Solution 1: Re-login (Most Common Fix)**

1. **Logout** from the application
2. **Clear browser storage:**
   ```javascript
   // Run in console
   localStorage.clear();
   sessionStorage.clear();
   ```
3. **Login again** with valid credentials
4. **Try CSV upload** again

### **Solution 2: Check Token Expiration**

If token exists but is expired:

1. **Check token expiration:**

   ```javascript
   const token = localStorage.getItem("authToken");
   if (token) {
     const payload = JSON.parse(atob(token.split(".")[1]));
     const expiration = new Date(payload.exp * 1000);
     console.log("Token expires:", expiration);
     console.log("Current time:", new Date());
     console.log("Is expired:", expiration < new Date());
   }
   ```

2. **If expired, logout and login again**

### **Solution 3: Manual Token Refresh**

If you have a refresh token endpoint:

```javascript
// Refresh token manually
fetch("/api/auth/refresh", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  body: JSON.stringify({
    refreshToken: localStorage.getItem("refreshToken"),
  }),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      localStorage.setItem("authToken", data.token);
      console.log("✅ Token refreshed successfully");
    }
  });
```

### **Solution 4: Bypass Authentication (Development Only)**

For testing purposes only, you can temporarily disable authentication:

1. **Open `frontend/src/api/axiosInstance.js`**
2. **Comment out the auth interceptor:**
   ```javascript
   // Request interceptor to add auth token
   // axiosInstance.interceptors.request.use(
   //   (config) => {
   //     const token = localStorage.getItem('authToken')
   //     if (token) {
   //       config.headers.Authorization = `Bearer ${token}`
   //     }
   //     return config
   //   },
   //   (error) => {
   //     return Promise.reject(error)
   //   }
   // )
   ```

## 🎯 **Quick Fix Steps**

### **Immediate Action:**

1. **Open browser console**
2. **Run this command:**
   ```javascript
   console.log("Current token:", localStorage.getItem("authToken"));
   ```
3. **If token is null or looks invalid:**
   - Logout from the application
   - Login again with valid credentials
   - Try CSV upload

### **Alternative Quick Fix:**

1. **Clear all storage:**
   ```javascript
   localStorage.clear();
   ```
2. **Refresh the page**
3. **Login again**
4. **Test CSV upload**

## 📊 **Expected Results After Fix**

Once authentication is fixed, you should see:

```
✅ Students CSV uploaded successfully: {success: true, message: "CSV processing completed. 3 students processed successfully."}
📊 Upload result analysis: {success: true, totalRows: 3, successful: 3, errors: 0}
📈 Processing Summary: 3/3 students processed successfully
```

## 🚀 **Test After Fix**

1. **Verify authentication** is working
2. **Try uploading any CSV file**
3. **Check console logs** for success messages
4. **Verify students are created** in the system

The authentication issue is usually resolved by simply logging out and logging back in! 🔐
