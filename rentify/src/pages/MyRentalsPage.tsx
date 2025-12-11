import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Calendar, Package, Clock } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getMyRentals, getMyListings } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { RentalItem } from '../utils/mockData';

interface Rental {
  id: string;
  item: RentalItem;
  startDate: string;
  endDate: string;
  status: string;
}

export function MyRentalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('renting');
  const [myRentals, setMyRentals] = useState<Rental[]>([]);
  const [myListings, setMyListings] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (activeTab === 'renting') {
      loadRentals();
    } else {
      loadListings();
    }
  }, [user, activeTab, navigate]);

  async function loadRentals() {
    try {
      setLoading(true);
      const { rentals } = await getMyRentals();
      // Filter out any null or undefined rentals
      setMyRentals(rentals?.filter((rental: Rental | null) => rental != null) || []);
    } catch (error) {
      console.error('Failed to load rentals:', error);
      setMyRentals([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadListings() {
    try {
      setLoading(true);
      const { items } = await getMyListings();
      // Filter out any null or undefined items
      setMyListings(items?.filter((item: RentalItem | null) => item != null) || []);
    } catch (error) {
      console.error('Failed to load listings:', error);
      setMyListings([]);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-slate-900 mb-6">My Rentals</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="renting">
            <Package className="size-4 mr-2" />
            I'm Renting
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Clock className="size-4 mr-2" />
            My Listings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="renting">
          {loading ? (
            <p className="text-slate-600">Loading rentals...</p>
          ) : myRentals.length === 0 ? (
            <p className="text-slate-600">No active rentals</p>
          ) : (
            <div className="space-y-4">
              {myRentals.map((rental, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex gap-4 flex-col sm:flex-row">
                      <div className="w-full sm:w-48 aspect-video rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <ImageWithFallback
                          src={rental.item.imageUrl}
                          alt={rental.item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-slate-900">{rental.item.title}</h3>
                          <Badge variant={rental.status === 'active' ? 'default' : 'secondary'}>
                            {rental.status === 'active' ? 'Active' : 'Completed'}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-4">{rental.item.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>
                              {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarImage
                                src={rental.item.owner.avatar}
                                alt={rental.item.owner.name}
                              />
                              <AvatarFallback>{rental.item.owner.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-600">{rental.item.owner.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/item/${rental.item.id}`)}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => navigate(`/chat/${rental.item.owner.id}`)}
                            >
                              Contact Owner
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="listings">
          {loading ? (
            <p className="text-slate-600">Loading listings...</p>
          ) : myListings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-4">You haven't listed any items yet</p>
              <Button onClick={() => navigate('/add-item')}>List Your First Item</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((item) => (
                <Card key={item.id}>
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{item.title}</CardTitle>
                      <Badge variant={item.available ? 'default' : 'secondary'}>
                        {item.available ? 'Available' : 'Rented'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-900">
                        ${item.price}
                        <span className="text-slate-600 text-sm">/{item.priceUnit}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/item/${item.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}