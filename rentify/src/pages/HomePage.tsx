import { useState, useEffect } from 'react';
import { ItemCard } from '../components/ItemCard';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search } from 'lucide-react';
import { getItems, getCategories, seedDemoData } from '../utils/api';
import { RentalItem } from '../utils/mockData';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items, setItems] = useState<RentalItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [hasCheckedForItems, setHasCheckedForItems] = useState(false);

  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedCategory, searchQuery]);

  async function loadCategories() {
    try {
      const { categories: cats } = await getCategories();
      // Filter out null values and "All" category, then add "All" at the beginning
      const validCategories = cats?.filter((cat: string | null) => cat != null && cat !== 'All') || [];
      setCategories(['All', ...validCategories]);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories(['All']);
    }
  }

  async function loadItems() {
    try {
      setLoading(true);
      const category = selectedCategory === 'All' ? undefined : selectedCategory;
      const search = searchQuery.trim() || undefined;
      const { items: fetchedItems } = await getItems(category, search);
      // Filter out any null or undefined items
      const validItems = fetchedItems?.filter((item: RentalItem | null) => item != null) || [];
      setItems(validItems);
      
      // Check if we should auto-seed (only on first load, no search/filter, and no items)
      if (!hasCheckedForItems && !category && !search && validItems.length === 0) {
        setHasCheckedForItems(true);
        await handleSeedDemoData();
      }
    } catch (error) {
      console.error('Failed to load items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedDemoData() {
    try {
      setSeeding(true);
      console.log('Seeding demo data...');
      await seedDemoData();
      console.log('Demo data seeded successfully');
      
      // Reload items after seeding (without auto-seed check)
      const category = selectedCategory === 'All' ? undefined : selectedCategory;
      const search = searchQuery.trim() || undefined;
      const { items: fetchedItems } = await getItems(category, search);
      const validItems = fetchedItems?.filter((item: RentalItem | null) => item != null) || [];
      setItems(validItems);
    } catch (error) {
      console.error('Failed to seed demo data:', error);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">Discover Items to Rent</h1>
        <p className="text-slate-600">
          Browse thousands of items available for rent in your area
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading || seeding ? (
        <div className="text-center py-16">
          <p className="text-slate-600">
            {seeding ? 'Setting up demo items...' : 'Loading items...'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-4">No items found matching your criteria.</p>
              {(selectedCategory !== 'All' || searchQuery.trim()) && (
                <Button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} variant="outline">
                  Clear filters
                </Button>
              )}
              {selectedCategory === 'All' && !searchQuery.trim() && (
                <Button onClick={handleSeedDemoData} disabled={seeding}>
                  Load Demo Items
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}