# RANTIFY Database Setup - Complete Guide

## ✅ What Has Been Implemented

Your RANTIFY rental marketplace now has a **fully functional Supabase backend** with the following features:

### 🔐 Authentication System
- **Sign up**: Create new user accounts with email, password, and name
- **Login**: Secure authentication using Supabase Auth
- **Session management**: Automatic session persistence across page reloads
- **Protected routes**: Pages like chat, rentals, and add-item require authentication

### 📦 Database Structure (using KV Store)
The database uses a key-value store structure to store:

1. **Users** (`user:{userId}`)
   - User profile information (id, email, name, avatar)

2. **Rental Items** (`item:{itemId}`)
   - All item details (title, description, price, category, location, images, owner info)
   - User listings tracked with `listings:user:{userId}`

3. **Messages** (`message:{messageId}`)
   - Chat messages between users
   - Conversations organized by `messages:{userId1}:{userId2}`
   - Conversation lists per user `conversations:{userId}`

4. **Rentals** (`rental:{rentalId}`)
   - Rental transactions with item, dates, and status
   - Tracked by renter: `rentals:renter:{userId}`
   - Tracked by owner: `rentals:owner:{userId}`

### 🚀 Backend API Endpoints

All endpoints are accessible at: `https://{projectId}.supabase.co/functions/v1/make-server-0d8d1b3e/`

#### Authentication
- `POST /auth/signup` - Create new user account
- `GET /auth/me` - Get current user profile

#### Items
- `GET /items` - Browse all rental items (supports category and search filters)
- `GET /items/:id` - Get single item details
- `POST /items` - Create new rental listing (requires auth)
- `PUT /items/:id` - Update item (requires auth, owner only)
- `POST /items/:id/upload-image` - Upload item image to Supabase Storage

#### Rentals
- `GET /rentals/my-rentals` - Get items you're currently renting (requires auth)
- `GET /rentals/my-listings` - Get your listed items (requires auth)
- `POST /rentals` - Create a new rental request (requires auth)

#### Messages
- `GET /messages/conversations` - Get all your conversations (requires auth)
- `GET /messages/:otherUserId` - Get messages with a specific user (requires auth)
- `POST /messages` - Send a message (requires auth)

#### Categories
- `GET /categories` - Get list of available categories

### 🎨 Frontend Integration

All pages have been updated to use the real backend:

1. **HomePage** - Fetches items from database with search and filtering
2. **ItemDetailPage** - Loads item details and allows rental requests
3. **AddItemPage** - Creates items in database with image upload
4. **ChatPage** - Real-time messaging between users
5. **MyRentalsPage** - Shows user's rentals and listings
6. **LoginPage** - User authentication
7. **SignupPage** - New user registration

### 📁 File Storage
- Images are stored in Supabase Storage bucket: `make-0d8d1b3e-rental-items`
- Signed URLs are generated for secure image access

## 🎯 How to Use Your Application

### For First-Time Users:
1. **Sign Up**: Navigate to `/signup` and create an account
2. **Browse Items**: View all available rental items on the home page
3. **List an Item**: Click "List Item" to add your own rental items
4. **Rent Items**: Click on any item to view details and request to rent
5. **Chat**: Message item owners through the integrated chat system
6. **Manage Rentals**: View your active rentals and listings in "My Rentals"

### Test Accounts:
You'll need to create your own accounts to test the system. The email confirmation is automatically set to `true`, so you don't need to verify emails.

## 🔧 Technical Details

### Authentication Flow:
1. User signs up → Backend creates user in Supabase Auth + stores profile in KV
2. User logs in → Frontend receives access token → Stored in localStorage
3. Protected requests → Access token sent in Authorization header
4. Session persists → Auth context checks for existing session on app load

### Data Flow Example (Creating an Item):
1. User fills out form in AddItemPage
2. Frontend calls `createItem()` API function
3. API sends POST request with auth token
4. Backend validates user, creates item in KV store
5. Backend adds item ID to user's listings
6. If image provided, uploads to Supabase Storage
7. Frontend navigates to home page showing new item

## 🐛 Troubleshooting

### Common Issues:

**"Unauthorized" errors:**
- Make sure you're logged in
- Check that your session token is valid
- Try logging out and logging back in

**Items not showing:**
- Create some items by clicking "List Item"
- Check browser console for API errors
- Verify Supabase connection is working

**Chat not working:**
- Both users must have accounts
- You can only chat with item owners
- Check that conversations are being created

**Image upload fails:**
- Ensure file is under 5MB
- Only image formats are supported (jpg, png, etc.)
- Check Supabase Storage bucket exists

## 📝 Next Steps

Your database is now fully operational! Here are some suggestions for enhancements:

1. **Add search filters** - Filter by price range, location, etc.
2. **Reviews and ratings** - Let users rate items and owners
3. **Payment integration** - Add Stripe for actual payments
4. **Notifications** - Email or push notifications for new messages
5. **Image gallery** - Support multiple images per item
6. **Availability calendar** - Block out dates when items are rented
7. **User profiles** - Detailed user pages with reviews and items

## 🔒 Security Notes

- Never share your Supabase service role key
- The key-value store is suitable for prototyping
- For production, consider using Supabase's PostgreSQL directly
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- This prototype is not intended for collecting sensitive PII

---

**Congratulations!** Your RANTIFY rental marketplace is now backed by a complete database system and ready for testing! 🎉
