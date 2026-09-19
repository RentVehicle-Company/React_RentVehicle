# fullpoint.md

# AI Project Context — Spring RentVehicle

> This file is an AI-readable context document generated from the provided OpenAPI specification. Use it together with the actual Java source code, database schema, configuration, and security configuration. Do not invent behavior that is not supported by the project.

## 1. Project Identity
- API title: `OpenAPI definition`
- API version: `v0`
- Server URL: `https://spring-rentvehicle.onrender.com`
- OpenAPI version: `3.0.1`
- Global security scheme: `bearerAuth`

## 2. AI Instructions
- Treat the OpenAPI contract as the current API contract for endpoints, parameters, DTOs, response types, and documented enums.
- Before editing code, inspect the existing project implementation. Do not create duplicate classes or replace existing architecture unnecessarily.
- Preserve the existing layered architecture: Entity → Repository → DTO → Mapper → Service → Controller.
- Prefer DTOs and existing mappers rather than exposing JPA entities directly.
- For bugs, trace Controller → Service → Mapper → Repository → Entity and check validation/security before changing persistence.
- If the Java implementation and this OpenAPI document differ, report the mismatch and inspect the implementation instead of guessing.
- Make the smallest correct change needed for the user's request.
- After changes, test the affected endpoint in Swagger and/or curl/Postman.

## 3. Main Features
- Authentication: registration, email OTP verification, resend OTP, login, refresh token, logout, Google login.
- User management and profile-image upload.
- Vehicle/product CRUD with filtering and pagination.
- Product image management and primary-image selection.
- Vehicle categories and vehicle types.
- Rental locations.
- Booking CRUD, user bookings, and total-price calculation.
- Payment CRUD, booking payments, KHQR QR image, and payment verification.

## 4. Endpoint Reference

## Authentication

### `POST /api/auth/verify-email`
- operationId: `verifyEmail`
- Request body:
  - `application/json` → `VerifyEmailRequestDTO`
- Responses:
  - `200`: `*/*` → `AuthResponseDTO`

### `POST /api/auth/resend-otp`
- operationId: `resendOtp`
- Parameters:
  - `email` (query, required): `string`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOVoid`

### `POST /api/auth/register`
- operationId: `register`
- Request body:
  - `application/json` → `RegisterRequestDTO`
- Responses:
  - `200`: `*/*` → `MessageResponseDTO`

### `POST /api/auth/refresh`
- operationId: `refresh`
- Request body:
  - `application/json` → `RefreshTokenRequestDTO`
- Responses:
  - `200`: `*/*` → `AuthResponseDTO`

### `POST /api/auth/logout`
- operationId: `logout`
- Parameters:
  - `Authorization` (header, required): `string`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOVoid`

### `POST /api/auth/login`
- operationId: `login`
- Request body:
  - `application/json` → `LoginRequestDTO`
- Responses:
  - `200`: `*/*` → `AuthResponseDTO`

### `POST /api/auth/google`
- operationId: `googleLogin`
- Request body:
  - `application/json` → `GoogleLoginRequestDTO`
- Responses:
  - `200`: `*/*` → `AuthResponseDTO`

## Users

### `GET /api/users/{id}`
- operationId: `getUserById`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOUserResponseDTO`

### `PUT /api/users/{id}`
- operationId: `updateUser`
- Parameters:
  - `id` (path, required): `integer`
- Request body:
  - `application/json` → `UpdateUserRequestDTO`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOUserResponseDTO`

### `DELETE /api/users/{id}`
- operationId: `deleteUser`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOVoid`

### `POST /api/users/{id}/profile-image`
- operationId: `uploadProfileImage`
- Summary: Upload profile image
- Parameters:
  - `id` (path, required): `integer`
- Request body:
  - `multipart/form-data` → `object`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOUserResponseDTO`

### `GET /api/users`
- operationId: `getAllUsers`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOListUserResponseDTO`

### `GET /api/users/me`
- operationId: `getCurrentUser`
- Responses:
  - `200`: `*/*` → `ApiResponseDTOUserResponseDTO`

## Products / Vehicles

### `GET /api/products/{id}`
- operationId: `getProductById`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `ProductResponse`

### `PUT /api/products/{id}`
- operationId: `updateProduct`
- Parameters:
  - `id` (path, required): `integer`
- Request body:
  - `application/json` → `ProductRequest`
- Responses:
  - `200`: `*/*` → `ProductResponse`

### `DELETE /api/products/{id}`
- operationId: `deleteProduct`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: no response body documented

### `GET /api/products`
- operationId: `getAllProducts`
- Parameters:
  - `categoryId` (query, optional): `integer`
  - `locationId` (query, optional): `integer`
  - `maxPrice` (query, optional): `number`
  - `isAvailable` (query, optional): `boolean`
  - `page` (query, optional): `integer`
  - `size` (query, optional): `integer`
- Responses:
  - `200`: `*/*` → `PageProductResponse`

### `POST /api/products`
- operationId: `createProduct`
- Request body:
  - `application/json` → `ProductRequest`
- Responses:
  - `200`: `*/*` → `ProductResponse`

## Product Images

### `PUT /api/products/{productId}/images/{imageId}/primary`
- operationId: `setPrimaryImage`
- Parameters:
  - `productId` (path, required): `integer`
  - `imageId` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `ProductImageResponse`

### `GET /api/products/{productId}/images`
- operationId: `getImagesByProductId`
- Parameters:
  - `productId` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `array<ProductImageResponse>`

### `POST /api/products/{productId}/images`
- operationId: `addImageWithFile_1`
- Parameters:
  - `productId` (path, required): `integer`
  - `imageUrl` (query, optional): `string`
  - `isPrimary` (query, optional): `boolean`
- Request body:
  - `multipart/form-data` → `object`
  - `application/json` → `ProductImageRequest`
- Responses:
  - `200`: `*/*` → `ProductImageResponse`

### `DELETE /api/products/{productId}/images/{imageId}`
- operationId: `deleteImage`
- Parameters:
  - `productId` (path, required): `integer`
  - `imageId` (path, required): `integer`
- Responses:
  - `200`: no response body documented

## Categories

### `GET /api/categories/{id}`
- operationId: `getById`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `CategoryResponseDTO`

### `PUT /api/categories/{id}`
- operationId: `update`
- Parameters:
  - `id` (path, required): `integer`
- Request body:
  - `application/json` → `CategoryUpdateDTO`
- Responses:
  - `200`: `*/*` → `CategoryResponseDTO`

### `DELETE /api/categories/{id}`
- operationId: `delete`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: no response body documented

### `GET /api/categories`
- operationId: `getAll`
- Parameters:
  - `vehicleType` (query, optional): `string`
- Responses:
  - `200`: `*/*` → `array<CategoryResponseDTO>`

### `POST /api/categories`
- operationId: `create`
- Request body:
  - `application/json` → `CategoryCreateDTO`
- Responses:
  - `200`: `*/*` → `CategoryResponseDTO`

## Locations

### `GET /api/locations/{id}`
- operationId: `getLocationById`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `LocationResponseDTO`

### `PUT /api/locations/{id}`
- operationId: `updateLocation`
- Parameters:
  - `id` (path, required): `integer`
- Request body:
  - `application/json` → `LocationRequestDTO`
- Responses:
  - `200`: `*/*` → `LocationResponseDTO`

### `DELETE /api/locations/{id}`
- operationId: `deleteLocation`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: no response body documented

### `GET /api/locations`
- operationId: `getAllLocations`
- Parameters:
  - `city` (query, optional): `string`
- Responses:
  - `200`: `*/*` → `array<LocationResponseDTO>`

### `POST /api/locations`
- operationId: `createLocation`
- Request body:
  - `application/json` → `LocationRequestDTO`
- Responses:
  - `200`: `*/*` → `LocationResponseDTO`

## Bookings

### `GET /api/bookings/{id}`
- operationId: `getBookingById`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `BookingResponseDTO`

### `PUT /api/bookings/{id}`
- operationId: `updateBooking`
- Parameters:
  - `id` (path, required): `integer`
- Request body:
  - `application/json` → `BookingRequestDTO`
- Responses:
  - `200`: `*/*` → `BookingResponseDTO`

### `DELETE /api/bookings/{id}`
- operationId: `deleteBooking`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: no response body documented

### `GET /api/bookings`
- operationId: `getAllBookings`
- Responses:
  - `200`: `*/*` → `array<BookingResponseDTO>`

### `POST /api/bookings`
- operationId: `createBooking`
- Summary: Create a booking with identity and driving license images
- Parameters:
  - `dto` (query, required): `BookingRequestDTO`
- Request body:
  - `multipart/form-data` → `object`
- Responses:
  - `200`: `*/*` → `BookingResponseDTO`

### `GET /api/bookings/{bookingId}/total-price`
- operationId: `getTotalPrice`
- Parameters:
  - `bookingId` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `number`

### `GET /api/bookings/my-bookings`
- operationId: `getMyBookings`
- Responses:
  - `200`: `*/*` → `array<BookingResponseDTO>`

## Payments + KHQR

### `GET /api/payments`
- operationId: `getAllPayments`
- Responses:
  - `200`: `*/*` → `array<PaymentResponseDTO>`

### `POST /api/payments`
- operationId: `createPayment`
- Request body:
  - `application/json` → `PaymentCreateDTO`
- Responses:
  - `200`: `*/*` → `PaymentResponseDTO`

### `GET /api/payments/{id}`
- operationId: `getPaymentById`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `PaymentResponseDTO`

### `GET /api/payments/{id}/verify`
- operationId: `verifyPayment`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `PaymentResponseDTO`

### `GET /api/payments/{id}/qr`
- operationId: `getPaymentQrImage`
- Parameters:
  - `id` (path, required): `integer`
- Responses:
  - `200`: `image/png` → `string`

### `GET /api/payments/my-payments`
- operationId: `getMyPayments`
- Responses:
  - `200`: `*/*` → `array<PaymentResponseDTO>`

### `GET /api/bookings/{bookingId}/payments`
- operationId: `getPaymentsByBooking`
- Parameters:
  - `bookingId` (path, required): `integer`
- Responses:
  - `200`: `*/*` → `array<PaymentResponseDTO>`

## 5. API Endpoint Summary

| Method | Path | Operation ID | Tag |
|---|---|---|---|
| `POST` | `/api/auth/verify-email` | `verifyEmail` | auth-controller |
| `POST` | `/api/auth/resend-otp` | `resendOtp` | auth-controller |
| `POST` | `/api/auth/register` | `register` | auth-controller |
| `POST` | `/api/auth/refresh` | `refresh` | auth-controller |
| `POST` | `/api/auth/logout` | `logout` | auth-controller |
| `POST` | `/api/auth/login` | `login` | auth-controller |
| `POST` | `/api/auth/google` | `googleLogin` | auth-controller |
| `GET` | `/api/users/{id}` | `getUserById` | user-controller |
| `PUT` | `/api/users/{id}` | `updateUser` | user-controller |
| `DELETE` | `/api/users/{id}` | `deleteUser` | user-controller |
| `POST` | `/api/users/{id}/profile-image` | `uploadProfileImage` | user-controller |
| `GET` | `/api/users` | `getAllUsers` | user-controller |
| `GET` | `/api/users/me` | `getCurrentUser` | user-controller |
| `GET` | `/api/products/{id}` | `getProductById` | product-controller |
| `PUT` | `/api/products/{id}` | `updateProduct` | product-controller |
| `DELETE` | `/api/products/{id}` | `deleteProduct` | product-controller |
| `GET` | `/api/products` | `getAllProducts` | product-controller |
| `POST` | `/api/products` | `createProduct` | product-controller |
| `PUT` | `/api/products/{productId}/images/{imageId}/primary` | `setPrimaryImage` | product-image-controller |
| `GET` | `/api/products/{productId}/images` | `getImagesByProductId` | product-image-controller |
| `POST` | `/api/products/{productId}/images` | `addImageWithFile_1` | product-image-controller |
| `DELETE` | `/api/products/{productId}/images/{imageId}` | `deleteImage` | product-image-controller |
| `GET` | `/api/categories/{id}` | `getById` | Category API CRUD |
| `PUT` | `/api/categories/{id}` | `update` | Category API CRUD |
| `DELETE` | `/api/categories/{id}` | `delete` | Category API CRUD |
| `GET` | `/api/categories` | `getAll` | Category API CRUD |
| `POST` | `/api/categories` | `create` | Category API CRUD |
| `GET` | `/api/locations/{id}` | `getLocationById` | location-controller |
| `PUT` | `/api/locations/{id}` | `updateLocation` | location-controller |
| `DELETE` | `/api/locations/{id}` | `deleteLocation` | location-controller |
| `GET` | `/api/locations` | `getAllLocations` | location-controller |
| `POST` | `/api/locations` | `createLocation` | location-controller |
| `GET` | `/api/bookings/{id}` | `getBookingById` | Booking API CRUD |
| `PUT` | `/api/bookings/{id}` | `updateBooking` | Booking API CRUD |
| `DELETE` | `/api/bookings/{id}` | `deleteBooking` | Booking API CRUD |
| `GET` | `/api/bookings` | `getAllBookings` | Booking API CRUD |
| `POST` | `/api/bookings` | `createBooking` | Booking API CRUD |
| `GET` | `/api/bookings/{bookingId}/total-price` | `getTotalPrice` | Booking API CRUD |
| `GET` | `/api/bookings/my-bookings` | `getMyBookings` | Booking API CRUD |
| `GET` | `/api/payments` | `getAllPayments` | Payment + KHQR |
| `POST` | `/api/payments` | `createPayment` | Payment + KHQR |
| `GET` | `/api/payments/{id}` | `getPaymentById` | Payment + KHQR |
| `GET` | `/api/payments/{id}/verify` | `verifyPayment` | Payment + KHQR |
| `GET` | `/api/payments/{id}/qr` | `getPaymentQrImage` | Payment + KHQR |
| `GET` | `/api/payments/my-payments` | `getMyPayments` | Payment + KHQR |
| `GET` | `/api/bookings/{bookingId}/payments` | `getPaymentsByBooking` | Payment + KHQR |

## 6. Core Workflows

### 6.1 Registration → OTP Verification
1. `POST /api/auth/register` accepts name, email, and password.
2. Password has a minimum length of 6 according to `RegisterRequestDTO`.
3. Email verification uses `POST /api/auth/verify-email` with email and a 6-character code.
4. OTP can be resent with `POST /api/auth/resend-otp?email=...`.
5. Successful verification returns `AuthResponseDTO` containing accessToken, refreshToken, and user.

### 6.2 Login → Refresh → Logout
1. `POST /api/auth/login` uses email and password.
2. `POST /api/auth/refresh` uses refreshToken.
3. `POST /api/auth/logout` requires the Authorization header.
4. `POST /api/auth/google` accepts a Google idToken.

### 6.3 Product / Vehicle Browsing
1. `GET /api/products` supports optional categoryId, locationId, maxPrice, isAvailable, page, and size.
2. `GET /api/products/{id}` gets one vehicle/product.
3. Product images are retrieved through `/api/products/{productId}/images`.
4. A product image can be marked primary with `/api/products/{productId}/images/{imageId}/primary`.

### 6.4 Booking
1. A booking requires productId, userId, pickupDate, returnDate, and contactPhone.
2. The documented create-booking endpoint uses multipart/form-data for idCardImage and drivingLicenseImage.
3. BookingResponseDTO contains totalAmount and status.
4. `GET /api/bookings/{bookingId}/total-price` returns the booking total.
5. `GET /api/bookings/my-bookings` returns the authenticated user's bookings.

### 6.5 Payment / KHQR
1. `POST /api/payments` creates a payment from bookingId, currency, and paymentMethod.
2. Documented payment methods are `KHQR` and `CASH`.
3. `GET /api/payments/{id}/qr` returns an `image/png` QR image.
4. `GET /api/payments/{id}/verify` verifies a payment.
5. `GET /api/bookings/{bookingId}/payments` gets payments belonging to a booking.
6. PaymentResponseDTO can contain qrString, transactionId, externalRef, failureReason, expiresAt, and paidAt.

## 7. DTO / Schema Reference

### `UpdateUserRequestDTO`
- Required: `email`, `name`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `name` | `string` |  |
| `email` | `string` |  |
| `address` | `string` |  |
| `phone` | `string` |  |

### `ApiResponseDTOUserResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `success` | `boolean` |  |
| `message` | `string` |  |
| `data` | `UserResponseDTO` |  |

### `UserResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `id` | `integer` | format: `int64` |
| `name` | `string` |  |
| `email` | `string` |  |
| `address` | `string` |  |
| `phone` | `string` |  |
| `profileImage` | `string` |  |
| `role` | `string` |  |
| `emailVerified` | `boolean` |  |
| `createdAt` | `string` | format: `date-time` |

### `ProductImageResponse`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `id` | `integer` | format: `int64` |
| `imageUrl` | `string` |  |
| `productId` | `integer` | format: `int64` |
| `isPrimary` | `boolean` |  |

### `ProductRequest`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `name` | `string` |  |
| `brand` | `string` |  |
| `model` | `string` |  |
| `modelYear` | `integer` | format: `int32` |
| `licensePlate` | `string` |  |
| `transmission` | `string` |  |
| `fuelType` | `string` |  |
| `seatingCapacity` | `integer` | format: `int32` |
| `material` | `string` |  |
| `speeds` | `string` |  |
| `wheelSize` | `string` |  |
| `engineCc` | `string` |  |
| `fuelEfficiency` | `string` |  |
| `topSpeed` | `string` |  |
| `pricePerDay` | `number` |  |
| `description` | `string` |  |
| `isAvailable` | `boolean` |  |
| `categoryId` | `integer` | format: `int64` |
| `locationId` | `integer` | format: `int64` |

### `ProductResponse`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `id` | `integer` | format: `int64` |
| `name` | `string` |  |
| `brand` | `string` |  |
| `model` | `string` |  |
| `modelYear` | `integer` | format: `int32` |
| `licensePlate` | `string` |  |
| `transmission` | `string` |  |
| `fuelType` | `string` |  |
| `seatingCapacity` | `integer` | format: `int32` |
| `material` | `string` |  |
| `speeds` | `string` |  |
| `wheelSize` | `string` |  |
| `engineCc` | `string` |  |
| `fuelEfficiency` | `string` |  |
| `topSpeed` | `string` |  |
| `pricePerDay` | `number` |  |
| `description` | `string` |  |
| `isAvailable` | `boolean` |  |
| `categoryId` | `integer` | format: `int64` |
| `locationId` | `integer` | format: `int64` |

### `LocationRequestDTO`
- Required: `address`, `city`, `name`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `name` | `string` |  |
| `address` | `string` |  |
| `city` | `string` |  |
| `latitude` | `number` | minimum=-90; maximum=90 |
| `longitude` | `number` | minimum=-180; maximum=180 |

### `LocationResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `id` | `integer` | format: `int32` |
| `name` | `string` |  |
| `address` | `string` |  |
| `city` | `string` |  |
| `latitude` | `number` |  |
| `longitude` | `number` |  |
| `createdAt` | `string` | format: `date-time` |
| `updatedAt` | `string` | format: `date-time` |

### `CategoryUpdateDTO`
- Required: `name`, `slug`, `vehicleType`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `name` | `string` | minLength=0; maxLength=100 |
| `slug` | `string` | minLength=0; maxLength=150 |
| `vehicleType` | `string` | enum: `moto`, `car`, `bicycle`, `car`, `moto`, `bicycle`; Vehicle type |
| `description` | `string` |  |

### `CategoryResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `id` | `integer` | format: `int32` |
| `name` | `string` |  |
| `slug` | `string` |  |
| `vehicleType` | `string` | enum: `moto`, `car`, `bicycle`, `car`, `moto`, `bicycle`; Vehicle type |
| `description` | `string` |  |
| `createAt` | `string` | format: `date-time` |
| `updateAt` | `string` | format: `date-time` |

### `BookingRequestDTO`
- Required: `contactPhone`, `pickupDate`, `productId`, `returnDate`, `userId`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `productId` | `integer` | format: `int64` |
| `userId` | `integer` | format: `int64` |
| `pickupDate` | `string` | format: `date-time` |
| `returnDate` | `string` | format: `date-time` |
| `contactPhone` | `string` |  |
| `notes` | `string` |  |

### `BookingResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `id` | `integer` | format: `int64` |
| `productId` | `integer` | format: `int64` |
| `userId` | `integer` | format: `int64` |
| `pickupDate` | `string` | format: `date-time` |
| `returnDate` | `string` | format: `date-time` |
| `contactPhone` | `string` |  |
| `notes` | `string` |  |
| `totalAmount` | `number` |  |
| `status` | `string` | enum: `pending`, `confirmed`, `completed`, `cancelled` |

### `ProductImageRequest`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `imageUrl` | `string` |  |
| `productId` | `integer` | format: `int64` |
| `isPrimary` | `boolean` |  |

### `PaymentCreateDTO`
- Required: `bookingId`, `currency`, `paymentMethod`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `bookingId` | `integer` | format: `int64` |
| `currency` | `string` |  |
| `paymentMethod` | `string` | enum: `KHQR`, `CASH` |

### `PaymentResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `id` | `integer` | format: `int64` |
| `bookingId` | `integer` | format: `int64` |
| `paymentReference` | `string` |  |
| `paymentMethod` | `string` | enum: `KHQR`, `CASH` |
| `amount` | `number` |  |
| `currency` | `string` |  |
| `paymentStatus` | `string` | enum: `PENDING`, `PAID`, `FAILED`, `EXPIRED`, `REFUNDED` |
| `transactionId` | `string` |  |
| `qrString` | `string` |  |
| `externalRef` | `string` |  |
| `failureReason` | `string` |  |
| `expiresAt` | `string` | format: `date-time` |
| `paidAt` | `string` | format: `date-time` |

### `CategoryCreateDTO`
- Required: `name`, `slug`, `vehicleType`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `name` | `string` | minLength=0; maxLength=100 |
| `slug` | `string` | minLength=0; maxLength=150 |
| `vehicleType` | `string` | enum: `moto`, `car`, `bicycle`, `car`, `moto`, `bicycle`; Vehicle type |
| `description` | `string` |  |

### `VerifyEmailRequestDTO`
- Required: `code`, `email`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `email` | `string` |  |
| `code` | `string` | minLength=6; maxLength=6 |

### `AuthResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `accessToken` | `string` |  |
| `refreshToken` | `string` |  |
| `user` | `UserResponseDTO` |  |

### `ApiResponseDTOVoid`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `success` | `boolean` |  |
| `message` | `string` |  |
| `data` | `object` |  |

### `RegisterRequestDTO`
- Required: `email`, `name`, `password`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `name` | `string` |  |
| `email` | `string` |  |
| `password` | `string` | minLength=6; maxLength=2147483647 |

### `MessageResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `message` | `string` |  |

### `RefreshTokenRequestDTO`
- Required: `refreshToken`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `refreshToken` | `string` |  |

### `LoginRequestDTO`
- Required: `email`, `password`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `email` | `string` |  |
| `password` | `string` |  |

### `GoogleLoginRequestDTO`
- Required: `idToken`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `idToken` | `string` |  |

### `ApiResponseDTOListUserResponseDTO`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `success` | `boolean` |  |
| `message` | `string` |  |
| `data` | `array<UserResponseDTO>` |  |

### `PageProductResponse`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `totalPages` | `integer` | format: `int32` |
| `totalElements` | `integer` | format: `int64` |
| `first` | `boolean` |  |
| `last` | `boolean` |  |
| `pageable` | `PageableObject` |  |
| `numberOfElements` | `integer` | format: `int32` |
| `size` | `integer` | format: `int32` |
| `content` | `array<ProductResponse>` |  |
| `number` | `integer` | format: `int32` |
| `sort` | `array<SortObject>` |  |
| `empty` | `boolean` |  |

### `PageableObject`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `paged` | `boolean` |  |
| `unpaged` | `boolean` |  |
| `pageSize` | `integer` | format: `int32` |
| `pageNumber` | `integer` | format: `int32` |
| `offset` | `integer` | format: `int64` |
| `sort` | `array<SortObject>` |  |

### `SortObject`

| Field | Type | Constraints / Enum / Notes |
|---|---|---|
| `direction` | `string` |  |
| `nullHandling` | `string` |  |
| `ascending` | `boolean` |  |
| `property` | `string` |  |
| `ignoreCase` | `boolean` |  |

## 8. Important Domain Rules Visible in the API Contract

### Users
- User response fields: id, name, email, address, phone, profileImage, role, emailVerified, createdAt.
- Profile image upload is multipart/form-data with a required `file` field.

### Products / Vehicles
- Product fields include name, brand, model, modelYear, licensePlate, transmission, fuelType, seatingCapacity, material, speeds, wheelSize, engineCc, fuelEfficiency, topSpeed, pricePerDay, description, isAvailable, categoryId, and locationId.
- Product listing is paginated.

### Categories
- Create/update requires name, slug, and vehicleType.
- The generated OpenAPI enum contains duplicate values; the unique documented values are `moto`, `car`, and `bicycle`.

### Bookings
- Required create/update fields: productId, userId, pickupDate, returnDate, contactPhone.
- Optional field: notes.
- Booking statuses: `pending`, `confirmed`, `completed`, `cancelled`.

### Payments
- Required payment creation fields: bookingId, currency, paymentMethod.
- Payment methods: `KHQR`, `CASH`.
- Payment statuses: `PENDING`, `PAID`, `FAILED`, `EXPIRED`, `REFUNDED`.

## 9. Request Format Warnings
- Product create/update uses JSON.
- User profile-image upload uses multipart/form-data.
- Product image upload documents multipart/form-data and an optional imageUrl query parameter.
- Booking creation is documented as multipart/form-data with identity-card and driving-license images.
- Payment QR image is returned as `image/png`.
- Do not change a multipart endpoint to JSON-only without checking the actual controller.

## 10. Security Notes
- The OpenAPI specification declares global `bearerAuth` security.
- Do not assume every endpoint is public; inspect Spring Security configuration for the real authorization rules.
- When debugging `401`, `403`, or authentication failures, inspect JWT parsing, SecurityFilterChain, authorities/roles, and Authorization headers.

## 11. Debugging Checklist
1. Identify the exact endpoint and HTTP method.
2. Check the path/query/body parameter names.
3. Check JSON vs multipart/form-data.
4. Check required fields and enum values.
5. Check authentication and role requirements.
6. Check DTO validation.
7. Trace Controller → Service → Mapper → Repository → Entity.
8. Check related database records and foreign keys.
9. Preserve the existing response DTO structure.
10. Test the fix in Swagger and curl/Postman.

## 12. Important AI Behavior
- Do not rewrite unrelated files.
- Do not remove existing features just to make one endpoint work.
- Do not invent database fields from API names.
- Do not assume enum values beyond those documented or found in the actual Java source.
- When the user asks for an OpenCode prompt, describe the exact problem, expected behavior, files/classes to inspect, constraints, and verification steps.
- When the user asks for an explanation, explain the code in simple student-friendly terms and connect Controller, DTO, Service, Mapper, Repository, and Entity responsibilities.

## 13. Source / Scope
- Source: uploaded OpenAPI specification for the Spring RentVehicle backend.
- Documented server: `https://spring-rentvehicle.onrender.com`.
- This file is an API-context document, not a complete copy of the Java project or database schema.
- If an answer requires information not present here, inspect the actual project files rather than guessing.