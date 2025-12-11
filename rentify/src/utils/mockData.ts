export interface RentalItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  category: string;
  imageUrl: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  location: string;
  available: boolean;
  bookedDates?: { start: Date; end: Date }[]; // Array of booked date ranges
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
}

export const currentUser = {
  id: 'current-user',
  name: 'You',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
};

export const rentalItems: RentalItem[] = [
  {
    id: '1',
    title: 'Canon EOS R5 Camera',
    description: 'Professional mirrorless camera with 45MP sensor. Perfect for photography and videography projects.',
    price: 75,
    priceUnit: 'day',
    category: 'Photography',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
    owner: {
      id: 'user-1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    location: 'Los Angeles, CA',
    available: true,
    bookedDates: [
      {
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      },
      {
        start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        end: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      },
    ],
  },
  {
    id: '2',
    title: 'Mountain Bike - Trek X-Caliber',
    description: 'High-performance mountain bike suitable for trails and rough terrain. Well-maintained and ready to ride.',
    price: 35,
    priceUnit: 'day',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800&h=600&fit=crop',
    owner: {
      id: 'user-2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    location: 'Portland, OR',
    available: true,
    bookedDates: [
      {
        start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    ],
  },
  {
    id: '3',
    title: 'Portable Generator 5000W',
    description: 'Reliable portable generator for outdoor events, camping, or emergency backup power.',
    price: 50,
    priceUnit: 'day',
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
    owner: {
      id: 'user-3',
      name: 'David Martinez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    location: 'Austin, TX',
    available: true,
    bookedDates: [
      {
        start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
    ],
  },
  {
    id: '4',
    title: 'DJI Mavic Air 2 Drone',
    description: 'Professional drone with 4K camera and 34-minute flight time. Great for aerial photography.',
    price: 60,
    priceUnit: 'day',
    category: 'Photography',
    imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=600&fit=crop',
    owner: {
      id: 'user-4',
      name: 'Emily Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    location: 'Seattle, WA',
    available: true,
    bookedDates: [],
  },
  {
    id: '5',
    title: 'Camping Tent - 6 Person',
    description: 'Spacious family tent with easy setup. Includes rain fly and storage pockets.',
    price: 25,
    priceUnit: 'day',
    category: 'Outdoor',
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=600&fit=crop',
    owner: {
      id: 'user-1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    location: 'Los Angeles, CA',
    available: true,
    bookedDates: [
      {
        start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        end: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
      },
    ],
  },
  {
    id: '6',
    title: 'Power Drill Set - DeWalt',
    description: 'Complete power drill set with various bits and accessories. Perfect for home projects.',
    price: 20,
    priceUnit: 'day',
    category: 'Tools',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop',
    owner: {
      id: 'user-2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    location: 'Portland, OR',
    available: false,
    bookedDates: [
      {
        start: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
        end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now (currently rented)
      },
    ],
  },
  {
    id: '7',
    title: 'Kayak - Single Person',
    description: 'Stable and easy-to-paddle kayak. Includes paddle and life jacket.',
    price: 40,
    priceUnit: 'day',
    category: 'Water Sports',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    owner: {
      id: 'user-3',
      name: 'David Martinez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    },
    location: 'Austin, TX',
    available: true,
    bookedDates: [],
  },
  {
    id: '8',
    title: 'Party Speaker System',
    description: 'High-quality speaker system with Bluetooth connectivity. Perfect for parties and events.',
    price: 45,
    priceUnit: 'day',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop',
    owner: {
      id: 'user-4',
      name: 'Emily Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    location: 'Seattle, WA',
    available: true,
    bookedDates: [
      {
        start: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      },
    ],
  },
];

export const chatConversations: ChatConversation[] = [
  {
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    lastMessage: 'Sure, the camera is available for those dates!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unread: 2,
  },
  {
    userId: 'user-2',
    userName: 'Mike Chen',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    lastMessage: 'Thanks for renting my bike!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 0,
  },
  {
    userId: 'user-3',
    userName: 'David Martinez',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    lastMessage: 'When can you pick up the generator?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unread: 1,
  },
];

export const mockMessages: { [key: string]: Message[] } = {
  'user-1': [
    {
      id: 'm1',
      senderId: 'current-user',
      receiverId: 'user-1',
      content: 'Hi! Is the Canon EOS R5 available next weekend?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: 'm2',
      senderId: 'user-1',
      receiverId: 'current-user',
      content: 'Hi! Yes, it is available. What dates are you looking for?',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      id: 'm3',
      senderId: 'current-user',
      receiverId: 'user-1',
      content: 'Saturday and Sunday would be perfect. Do you include any lenses?',
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
    },
    {
      id: 'm4',
      senderId: 'user-1',
      receiverId: 'current-user',
      content: 'Sure, the camera is available for those dates!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
  ],
  'user-2': [
    {
      id: 'm5',
      senderId: 'current-user',
      receiverId: 'user-2',
      content: 'I would like to rent the mountain bike for tomorrow.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: 'm6',
      senderId: 'user-2',
      receiverId: 'current-user',
      content: 'Thanks for renting my bike!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ],
  'user-3': [
    {
      id: 'm7',
      senderId: 'user-3',
      receiverId: 'current-user',
      content: 'When can you pick up the generator?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ],
};