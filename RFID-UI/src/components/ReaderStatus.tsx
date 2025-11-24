import { useEffect, useState } from 'react';
import { Radio, Wifi, WifiOff, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface ReaderAntenna {
  number: number;
  status: 'active' | 'inactive';
  tagsDetected: number;
  power: number;   // 0 or 30 from backend
}

interface Reader {
  id: string;
  name: string;
  model: string;
  location: string;
  status: 'online' | 'offline';
  ipAddress: string;
  antennas: ReaderAntenna[];
  totalTagsDetected: number;
  uptime: string;
}

export function ReaderStatus() {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('http://10.80.26.210:8000/api/readers/status/', {credentials: "include",});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setReaders(data.readers || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load reader status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onlineReaders = readers.filter((r) => r.status === 'online').length;
  const totalTags = readers.reduce((sum, r) => sum + r.totalTagsDetected, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Reader Status</h2>
        <p className="text-slate-600">Monitor RFID reader health and antenna performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Active Readers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">
              {onlineReaders} / {readers.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total Tags Detected (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{totalTags}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={onlineReaders > 0 ? 'text-green-600' : 'text-red-600'}>
              {onlineReaders > 0 ? 'Healthy' : 'No active readers'}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <Card>
          <CardContent className="py-4 text-center text-slate-500">
            Loading reader status…
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-4 text-center text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Reader Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {readers.map((reader) => (
          <Card key={reader.id} className={reader.status === 'offline' ? 'opacity-75' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Radio className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{reader.name}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      {reader.model || 'Unknown model'}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    reader.status === 'online'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }
                >
                  {reader.status === 'online' ? (
                    <div className="flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      Online
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </div>
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Reader Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <div className="text-sm text-slate-500">Location</div>
                  <div className="text-slate-900">{reader.location || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">IP Address</div>
                  <div className="text-slate-900 font-mono text-sm">
                    {reader.ipAddress || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Tags Detected (24h)</div>
                  <div className="text-slate-900">{reader.totalTagsDetected}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Uptime</div>
                  <div className="text-slate-900">{reader.uptime}</div>
                </div>
              </div>

              {/* Antennas */}
              <div>
                <div className="text-sm text-slate-600 mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Antenna Status
                </div>
                {reader.antennas.length === 0 && (
                  <div className="text-sm text-slate-500">
                    No antennas configured for this reader.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {reader.antennas.map((antenna) => (
                    <div key={antenna.number} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">
                          Antenna {antenna.number}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            antenna.status === 'active'
                              ? 'border-green-300 text-green-700'
                              : 'border-slate-300 text-slate-500'
                          }
                        >
                          {antenna.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Tags: {antenna.tagsDetected}</span>
                          <span>Power: {antenna.power} dBm</span>
                        </div>
                        <Progress value={(antenna.power / 31) * 100} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
