# Ready-to-Use API Requests for Postman

## ✅ Test 1: Check Backend Connection

**Method:** GET
**URL:** http://localhost:5000

Just click Send - no body needed!

---

## ✅ Test 2: Create a Product

**Method:** POST
**URL:** http://localhost:5000/api/products

**Headers:**
- Key: `Content-Type`
- Value: `application/json`

**Body (select "raw" and "JSON"):**
```json
{
  "title": "Fresh Tomatoes",
  "description": "Organic red tomatoes from local farms",
  "price": 50,
  "category": "Vegetables",
  "image": "https://images.unsplash.com/photo-1546470427-227e1e3a8994",
  "stock": 100
}
```

---

## ✅ Test 3: Get All Products

**Method:** GET
**URL:** http://localhost:5000/api/products

No body needed!

---

## More Products to Create

### Carrots
```json
{
  "title": "Fresh Carrots",
  "description": "Crunchy orange carrots",
  "price": 40,
  "category": "Vegetables",
  "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37",
  "stock": 80
}
```

### Apples
```json
{
  "title": "Red Apples",
  "description": "Sweet and crispy apples",
  "price": 120,
  "category": "Fruits",
  "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
  "stock": 50
}
```

### Milk
```json
{
  "title": "Fresh Milk",
  "description": "Pure cow milk - 1 liter",
  "price": 60,
  "category": "Dairy",
  "image": "https://images.unsplash.com/photo-1563636619-e9143da7973b",
  "stock": 30
}
```

---

## Create a Store

**Method:** POST
**URL:** http://localhost:5000/api/stores

**Headers:** Content-Type: application/json

**Body:**
```json
{
  "name": "Fresh Mart",
  "type": "Grocery",
  "address": "123 Main Street, Downtown",
  "city": "Mumbai",
  "timing": "9:00 AM - 9:00 PM",
  "mobile": "9876543210",
  "image": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a"
}
```

---

## Create News

**Method:** POST
**URL:** http://localhost:5000/api/news

**Headers:** Content-Type: application/json

**Body:**
```json
{
  "title": "Fresh Organic Vegetables Available",
  "content": "We now offer fresh organic vegetables from local farms!",
  "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999",
  "category": "General",
  "featured": true
}
```

---

## 🎯 Your APIs are Working!

The backend is correct. Just copy the JSON from above and paste it in Postman's Body tab (select "raw" and "JSON").
