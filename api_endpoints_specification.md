# API Endpoints Documentation

This document lists all available API endpoints organized by their respective controllers and modules.

## 1. Authentication (`auth-controller`)
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate and log in a user
- `POST /api/auth/google` - Authenticate via Google
- `POST /api/auth/verify-email` - Verify user email address
- `POST /api/auth/resend-otp` - Resend One-Time Password (OTP)
- `POST /api/auth/refresh` - Refresh authentication token
- `POST /api/auth/logout` - Log out the current user

## 2. Users (`user-controller`)
- `GET /api/users` - Retrieve a list of all users
- `GET /api/users/{id}` - Retrieve user details by ID
- `PUT /api/users/{id}` - Update user information by ID
- `DELETE /api/users/{id}` - Delete a user by ID
- `POST /api/users/{id}/profile-image` - Upload profile image

## 3. Products (`product-controller`)
- `GET /api/products` - Retrieve a list of all products
- `POST /api/products` - Create a new product
- `GET /api/products/{id}` - Retrieve product details by ID
- `PUT /api/products/{id}` - Update product by ID
- `DELETE /api/products/{id}` - Delete product by ID

## 4. Product Images (`product-image-controller`)
- `GET /api/products/{productId}/images` - Retrieve all images for a specific product
- `POST /api/products/{productId}/images` - Upload a new image for a product
- `PUT /api/products/{productId}/images/{imageId}/primary` - Set an image as the primary product image
- `DELETE /api/products/{productId}/images/{imageId}` - Delete a specific product image

## 5. Locations (`location-controller`)
- `GET /api/locations` - Retrieve a list of all locations
- `POST /api/locations` - Create a new location
- `GET /api/locations/{id}` - Retrieve location details by ID
- `PUT /api/locations/{id}` - Update location by ID
- `DELETE /api/locations/{id}` - Delete location by ID

## 6. Categories (`Category API CRUD`)
- `GET /api/categories` - Retrieve a list of all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/{id}` - Retrieve category details by ID
- `PUT /api/categories/{id}` - Update category by ID
- `DELETE /api/categories/{id}` - Delete category by ID

## 7. Bookings (`Booking API CRUD`)
- `GET /api/bookings` - Retrieve a list of all bookings
- `POST /api/bookings` - Create a booking with identity and driving license images
- `GET /api/bookings/{id}` - Retrieve booking details by ID
- `PUT /api/bookings/{id}` - Update booking by ID
- `DELETE /api/bookings/{id}` - Delete booking by ID
- `GET /api/bookings/{bookingId}/total-price` - Calculate and get the total price for a booking

## 8. Payments & KHQR (`Payment + KHQR`)
- `GET /api/payments` - Retrieve a list of all payments
- `POST /api/payments` - Create a new payment record
- `GET /api/payments/{id}` - Retrieve payment details by ID
- `GET /api/payments/{id}/verify` - Verify the status of a payment
- `GET /api/payments/{id}/qr` - Generate/Retrieve KHQR code for payment
- `GET /api/bookings/{bookingId}/payments` - Retrieve payments associated with a specific booking