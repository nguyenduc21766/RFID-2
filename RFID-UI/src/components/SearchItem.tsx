import { useState } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface TimelineEvent {
  timestamp: string;
  location: string;
  reader: string;
  antenna: number | null;
}

interface SearchResult {
  epc: string;
  objectName: string;
  responsiblePerson: string;
  currentLocation: string;
  status: 'active' | 'idle' | 'missing';
  timeline: TimelineEvent[];
}

export function SearchItem() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------------
     Handle search (API call)
  -------------------------------------------------------- */
  const handleSearch = async () => {
    setSearched(true);
    setError(null);
    setSearchResult(null);

    const q = searchQuery.trim();
    if (!q) {
      setError("Please enter EPC, tag ID, or object name");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://10.80.26.210:8000/api/items/search/?q=${encodeURIComponent(q)}`, {credentials: "include",}
      );

      if (res.status === 404) {
        setSearchResult(null);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data.found && data.item) {
        setSearchResult({
          epc: data.item.epc,
          objectName: data.item.objectName,
          responsiblePerson: data.item.responsiblePerson,
          currentLocation: data.item.currentLocation,
          status: data.item.status,
          timeline: data.item.timeline,
        });
      } else {
        setSearchResult(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to search item");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      idle: 'bg-yellow-100 text-yellow-700',
      missing: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Search Item</h2>
        <p className="text-slate-600">Find and track items by EPC, tag ID, or object name</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Enter EPC or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Searching…
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="py-4 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searched && !loading && searchResult === null && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <div className="text-slate-900 mb-1">No results found</div>
            <div className="text-sm text-slate-500">
              Try searching for an EPC stored in <b>rfid_items_temp</b>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Result */}
      {searchResult && (
        <>
          {/* Item Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{searchResult.objectName}</CardTitle>
                  <p className="text-sm text-slate-500 font-mono mt-1">{searchResult.epc}</p>
                </div>
                <Badge className={getStatusColor(searchResult.status)}>
                  {searchResult.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-500">Responsible Person</div>
                    <div className="text-slate-900">{searchResult.responsiblePerson}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Current Location
                    </div>
                    <div className="text-slate-900">{searchResult.currentLocation}</div>
                  </div>
                </div>

                {/* Placeholder Visual */}
                <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm text-slate-600">Location Diagram</div>
                    <div className="text-xs text-slate-500 mt-1">Visual zone map placeholder</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {searchResult.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      {idx < searchResult.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                      )}
                    </div>

                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-slate-900">{event.location}</div>
                        <div className="text-sm text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {event.reader} • Antenna {event.antenna}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
