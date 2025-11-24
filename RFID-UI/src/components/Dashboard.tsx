import { useState, useEffect } from 'react';
import { RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

// ----------------------
//     Types
// ----------------------
interface RFIDTag {
  id: string;
  epc: string;
  objectName: string;
  reader: string;
  antenna: number | null;
  rssi: number | null;
  mac: string;
  lastSeen: string; 
  status: 'active' | 'idle' | 'missing';
  activityLog: Array<{
    timestamp: string;
    reader: string;
    antenna: number | null;
    rssi: number | null;
  }>;
}

// ----------------------
//     Component
// ----------------------
export function Dashboard() {
  const [tags, setTags] = useState<RFIDTag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // -------------------------
  // Fetch from Django API
  // -------------------------
  const fetchTags = async () => {
    try {
      const res = await fetch('http://10.80.26.210:8000/api/dashboard/live-tags/', {credentials: "include",});
      
      const data = await res.json();
      setTags(data.tags);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  useEffect(() => {
    fetchTags(); // load on page open

    const interval = setInterval(fetchTags, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  // -------------------------
  // Filtering
  // -------------------------
  const filteredTags = tags.filter(tag =>
    tag.epc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.objectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.reader.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.mac.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------
  // Row Expand Logic
  // -------------------------
  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  // -------------------------
  // UI Helpers
  // -------------------------
  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-700',
      idle: 'bg-yellow-100 text-yellow-700',
      missing: 'bg-red-100 text-red-700',
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // -------------------------
  //     RENDER
  // -------------------------
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">Real-time RFID tag tracking and monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{tags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">{tags.filter(t => t.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Idle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-yellow-600">{tags.filter(t => t.status === 'idle').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-600">{tags.filter(t => t.status === 'missing').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Tracked RFID Tags</CardTitle>
              <p className="text-sm text-slate-500">Last updated {lastUpdated.toLocaleTimeString()}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by EPC, name, reader, or MAC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Button onClick={fetchTags} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>EPC</TableHead>
                  <TableHead>Object Name</TableHead>
                  <TableHead>Reader</TableHead>
                  <TableHead>Antenna</TableHead>
                  <TableHead>RSSI</TableHead>
                  <TableHead>MAC</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTags.map(tag => (
                  <>
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleRow(tag.id)}>
                          {expandedRows.has(tag.id) ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                      </TableCell>

                      <TableCell className="font-mono text-xs">{tag.epc}</TableCell>
                      <TableCell>{tag.objectName}</TableCell>
                      <TableCell>{tag.reader}</TableCell>
                      <TableCell>{tag.antenna ?? '-'}</TableCell>
                      <TableCell>{tag.rssi ?? '-'} dBm</TableCell>
                      <TableCell className="font-mono text-xs">{tag.mac}</TableCell>
                      <TableCell>{formatTime(tag.lastSeen)}</TableCell>
                      <TableCell>{getStatusBadge(tag.status)}</TableCell>
                    </TableRow>

                    {expandedRows.has(tag.id) && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-slate-50">
                          <div className="p-4">
                            <h4 className="text-sm text-slate-900 mb-3">Recent Activity Log</h4>

                            {tag.activityLog.map((log, idx) => (
                              <div key={idx} className="flex gap-4 text-sm border-l-2 border-blue-500 pl-4 py-1">
                                <span className="text-slate-500 w-40">{new Date(log.timestamp).toLocaleString()}</span>
                                <span className="text-slate-700">{log.reader}</span>
                                <span>Antenna {log.antenna ?? '-'}</span>
                                <span>{log.rssi ?? '-'} dBm</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
