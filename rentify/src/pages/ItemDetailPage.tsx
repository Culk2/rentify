import { useParams, useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { MapPin, MessageSquare, ArrowLeft, CalendarX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getItem, createRental } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { RentalItem } from '../utils/mockData';
import { Alert, AlertDescription } from '../components/ui/alert';

export function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<RentalItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<Date | undefined>(new Date());
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  async function loadItem() {
    try {
      setLoading(true);
      const { item: fetchedItem } = await getItem(id!);
      setItem(fetchedItem);
    } catch (error) {
      console.error('Failed to load item:', error);
      setError('Item not found');
    } finally {
      setLoading(false);
    }
  }

  // Function to check if a date is within any booked range
  const isDateBooked = (date: Date) => {
    if (!item?.bookedDates) return false;
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return item.bookedDates.some((booking) => {
      const startDate = new Date(booking.start.getFullYear(), booking.start.getMonth(), booking.start.getDate());
      const endDate = new Date(booking.end.getFullYear(), booking.end.getMonth(), booking.end.getDate());
      
      return dateOnly >= startDate && dateOnly <= endDate;
    });
  };

  // Disable past dates and booked dates
  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable booked dates
    return isDateBooked(date);
  };

  async function handleRequestRental() {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDates || !item) return;

    setRequesting(true);
    setError('');

    try {
      // For demo purposes, we'll rent for 3 days starting from selected date
      const startDate = selectedDates.toISOString();
      const endDate = new Date(selectedDates.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

      await createRental({
        itemId: item.id,
        startDate,
        endDate,
      });

      alert('Rental request sent successfully!');
      navigate('/my-rentals');
    } catch (err: any) {
      console.error('Failed to create rental:', err);
      setError(err.message || 'Failed to create rental');
    } finally {
      setRequesting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-600">Loading item...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-600">Item not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-4">
            <ImageWithFallback
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-slate-900 mb-2">{item.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant={item.available ? 'default' : 'secondary'}>
                  {item.available ? 'Available' : 'Currently Rented'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-slate-900 mb-6">
            ${item.price}
            <span className="text-slate-600">/{item.priceUnit}</span>
          </div>

          <p className="text-slate-600 mb-6">{item.description}</p>

          <div className="flex items-center gap-2 text-slate-600 mb-6">
            <MapPin className="size-4" />
            <span>{item.location}</span>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={item.owner.avatar} alt={item.owner.name} />
                    <AvatarFallback>{item.owner.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-slate-900">{item.owner.name}</p>
                    <p className="text-sm text-slate-600">Owner</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/chat/${item.owner.id}`}>
                    <MessageSquare className="size-4 mr-2" />
                    Message
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-slate-900 mb-4">Select Rental Dates</h3>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {item.bookedDates && item.bookedDates.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2">
                    <CalendarX className="size-4 text-slate-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-900 mb-1">Reserved Dates</p>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {item.bookedDates.map((booking, index) => (
                          <div key={index}>
                            {new Date(booking.start).toLocaleDateString('sl-SI', { 
                              month: 'short', 
                              day: 'numeric' 
                            })} - {new Date(booking.end).toLocaleDateString('sl-SI', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <Calendar
                mode="single"
                selected={selectedDates}
                onSelect={setSelectedDates}
                className="rounded-md border"
                disabled={disabledDates}
              />
              <p className="text-xs text-slate-500 mt-2">
                Grayed out dates are not available for booking
              </p>
              <Button
                className="w-full mt-4"
                disabled={!item.available || requesting || !user}
                onClick={handleRequestRental}
              >
                {!user
                  ? 'Login to Rent'
                  : requesting
                  ? 'Requesting...'
                  : item.available
                  ? 'Request to Rent'
                  : 'Not Available'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}