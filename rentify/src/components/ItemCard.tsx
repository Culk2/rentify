import { Link } from 'react-router';
import { RentalItem } from '../utils/mockData';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ItemCardProps {
  item: RentalItem;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link to={`/item/${item.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <ImageWithFallback
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-slate-900 line-clamp-1">{item.title}</h3>
            <Badge variant={item.available ? 'default' : 'secondary'} className="shrink-0">
              {item.available ? 'Available' : 'Rented'}
            </Badge>
          </div>
          <p className="text-slate-600 text-sm line-clamp-2 mb-3">{item.description}</p>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <MapPin className="size-4" />
            <span>{item.location}</span>
          </div>
          <div className="text-slate-900">
            ${item.price}
            <span className="text-slate-600 text-sm">/{item.priceUnit}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={item.owner.avatar} alt={item.owner.name} />
              <AvatarFallback>{item.owner.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-600">{item.owner.name}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
