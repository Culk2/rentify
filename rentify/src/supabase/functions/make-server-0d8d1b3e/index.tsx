import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create storage bucket for item images on startup
const bucketName = 'make-0d8d1b3e-rental-items';
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false });
      console.log(`Created storage bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error('Error creating storage bucket:', error);
  }
})();

// Helper function to get user from access token
async function getUserFromToken(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

// ============= AUTH ROUTES =============

app.post('/make-server-0d8d1b3e/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store user profile in KV store
    const userId = authData.user.id;
    const userProfile = {
      id: userId,
      email,
      name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200`,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userProfile);

    return c.json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

app.post('/make-server-0d8d1b3e/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // This is handled by Supabase client in frontend
    return c.json({ error: 'Use Supabase client for login' }, 400);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

app.get('/make-server-0d8d1b3e/auth/me', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ user: userProfile });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ error: 'Failed to get user' }, 500);
  }
});

// ============= ITEMS ROUTES =============

app.get('/make-server-0d8d1b3e/items', async (c) => {
  try {
    const category = c.req.query('category');
    const search = c.req.query('search');

    // Get all items from KV store
    let items = await kv.getByPrefix('item:');

    // Filter by category if provided
    if (category && category !== 'All') {
      items = items.filter((item: any) => item?.category === category);
    }

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter(
        (item: any) =>
          item?.title?.toLowerCase().includes(searchLower) ||
          item?.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter out null/undefined items
    items = items.filter((item: any) => item != null);

    // Sort by created date (newest first)
    items.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return c.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    return c.json({ error: 'Failed to get items' }, 500);
  }
});

app.get('/make-server-0d8d1b3e/items/:id', async (c) => {
  try {
    const itemId = c.req.param('id');
    const item = await kv.get(`item:${itemId}`);

    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    return c.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    return c.json({ error: 'Failed to get item' }, 500);
  }
});

app.post('/make-server-0d8d1b3e/items', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { title, description, price, priceUnit, category, location, imageUrl } = body;

    if (!title || !description || !price || !priceUnit || !category || !location) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Get user profile
    const userProfile = await kv.get(`user:${user.id}`);

    const itemId = crypto.randomUUID();
    const item = {
      id: itemId,
      title,
      description,
      price: parseFloat(price),
      priceUnit,
      category,
      location,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
      owner: {
        id: user.id,
        name: userProfile.name,
        avatar: userProfile.avatar,
      },
      available: true,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`item:${itemId}`, item);

    // Add to user's listings
    const userListings = (await kv.get(`listings:user:${user.id}`)) || [];
    userListings.push(itemId);
    await kv.set(`listings:user:${user.id}`, userListings);

    return c.json({ success: true, item });
  } catch (error) {
    console.error('Create item error:', error);
    return c.json({ error: 'Failed to create item' }, 500);
  }
});

app.put('/make-server-0d8d1b3e/items/:id', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const itemId = c.req.param('id');
    const item = await kv.get(`item:${itemId}`);

    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    if (item.owner.id !== user.id) {
      return c.json({ error: 'Not authorized to update this item' }, 403);
    }

    const body = await c.req.json();
    const updatedItem = {
      ...item,
      ...body,
      id: itemId,
      owner: item.owner,
    };

    await kv.set(`item:${itemId}`, updatedItem);

    return c.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Update item error:', error);
    return c.json({ error: 'Failed to update item' }, 500);
  }
});

app.post('/make-server-0d8d1b3e/items/:id/upload-image', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const itemId = c.req.param('id');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}-${Date.now()}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    // Get signed URL
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

    return c.json({ success: true, imageUrl: urlData?.signedUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// ============= RENTALS ROUTES =============

app.get('/make-server-0d8d1b3e/rentals/my-rentals', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get rentals where user is the renter
    const userRentalIds = (await kv.get(`rentals:renter:${user.id}`)) || [];
    const rentals = await Promise.all(
      userRentalIds.map((id: string) => kv.get(`rental:${id}`))
    );

    return c.json({ rentals: rentals.filter(Boolean) });
  } catch (error) {
    console.error('Get my rentals error:', error);
    return c.json({ error: 'Failed to get rentals' }, 500);
  }
});

app.get('/make-server-0d8d1b3e/rentals/my-listings', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user's listed items
    const userListingIds = (await kv.get(`listings:user:${user.id}`)) || [];
    const items = await Promise.all(
      userListingIds.map((id: string) => kv.get(`item:${id}`))
    );

    return c.json({ items: items.filter(Boolean) });
  } catch (error) {
    console.error('Get my listings error:', error);
    return c.json({ error: 'Failed to get listings' }, 500);
  }
});

app.post('/make-server-0d8d1b3e/rentals', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { itemId, startDate, endDate } = body;

    if (!itemId || !startDate || !endDate) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const item = await kv.get(`item:${itemId}`);
    if (!item) {
      return c.json({ error: 'Item not found' }, 404);
    }

    if (!item.available) {
      return c.json({ error: 'Item is not available' }, 400);
    }

    const rentalId = crypto.randomUUID();
    const rental = {
      id: rentalId,
      item,
      renterId: user.id,
      ownerId: item.owner.id,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`rental:${rentalId}`, rental);

    // Add to renter's rentals
    const renterRentals = (await kv.get(`rentals:renter:${user.id}`)) || [];
    renterRentals.push(rentalId);
    await kv.set(`rentals:renter:${user.id}`, renterRentals);

    // Add to owner's rentals
    const ownerRentals = (await kv.get(`rentals:owner:${item.owner.id}`)) || [];
    ownerRentals.push(rentalId);
    await kv.set(`rentals:owner:${item.owner.id}`, ownerRentals);

    // Mark item as unavailable
    await kv.set(`item:${itemId}`, { ...item, available: false });

    return c.json({ success: true, rental });
  } catch (error) {
    console.error('Create rental error:', error);
    return c.json({ error: 'Failed to create rental' }, 500);
  }
});

// ============= MESSAGES ROUTES =============

app.get('/make-server-0d8d1b3e/messages/conversations', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get all conversations for the user
    const conversationIds = (await kv.get(`conversations:${user.id}`)) || [];
    const conversations = [];

    for (const otherUserId of conversationIds) {
      const otherUser = await kv.get(`user:${otherUserId}`);
      if (!otherUser) continue;

      // Get conversation key (sorted user IDs)
      const convKey = [user.id, otherUserId].sort().join(':');
      const messageIds = (await kv.get(`messages:${convKey}`)) || [];

      let lastMessage = '';
      let lastMessageTime = new Date();
      if (messageIds.length > 0) {
        const lastMsg = await kv.get(`message:${messageIds[messageIds.length - 1]}`);
        if (lastMsg) {
          lastMessage = lastMsg.content;
          lastMessageTime = new Date(lastMsg.timestamp);
        }
      }

      conversations.push({
        userId: otherUserId,
        userName: otherUser.name,
        userAvatar: otherUser.avatar,
        lastMessage,
        lastMessageTime,
        unread: 0, // TODO: implement unread count
      });
    }

    // Sort by last message time
    conversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

    return c.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    return c.json({ error: 'Failed to get conversations' }, 500);
  }
});

app.get('/make-server-0d8d1b3e/messages/:otherUserId', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const otherUserId = c.req.param('otherUserId');

    // Get conversation key (sorted user IDs)
    const convKey = [user.id, otherUserId].sort().join(':');
    const messageIds = (await kv.get(`messages:${convKey}`)) || [];

    const messages = await Promise.all(
      messageIds.map((id: string) => kv.get(`message:${id}`))
    );

    return c.json({ messages: messages.filter(Boolean) });
  } catch (error) {
    console.error('Get messages error:', error);
    return c.json({ error: 'Failed to get messages' }, 500);
  }
});

app.post('/make-server-0d8d1b3e/messages', async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const messageId = crypto.randomUUID();
    const message = {
      id: messageId,
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`message:${messageId}`, message);

    // Get conversation key (sorted user IDs)
    const convKey = [user.id, receiverId].sort().join(':');
    const messageIds = (await kv.get(`messages:${convKey}`)) || [];
    messageIds.push(messageId);
    await kv.set(`messages:${convKey}`, messageIds);

    // Update conversation lists for both users
    const senderConversations = (await kv.get(`conversations:${user.id}`)) || [];
    if (!senderConversations.includes(receiverId)) {
      senderConversations.push(receiverId);
      await kv.set(`conversations:${user.id}`, senderConversations);
    }

    const receiverConversations = (await kv.get(`conversations:${receiverId}`)) || [];
    if (!receiverConversations.includes(user.id)) {
      receiverConversations.push(user.id);
      await kv.set(`conversations:${receiverId}`, receiverConversations);
    }

    return c.json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// ============= CATEGORIES ROUTE =============

app.get('/make-server-0d8d1b3e/categories', async (c) => {
  const categories = [
    'All',
    'Photography',
    'Sports',
    'Tools',
    'Outdoor',
    'Water Sports',
    'Electronics',
    'Camping',
    'Music',
    'Gaming',
  ];
  return c.json({ categories });
});

Deno.serve(app.fetch);
