import { useEffect, useState } from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  timestamp: Date;
  epc: string;
  objectName: string;
  reader: string;
  antenna: number;
  rssi: number;
  eventType: string;
}

const BASE_URL = 'http://10.80.26.210:8000';

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReader, setFilterReader] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');

  // Default date: last 7 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });

  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // ================= FETCH LOGS =================
  const fetchLogs = async () => {
    try {
      let url = `${BASE_URL}/api/activity-logs/`;

      const params: string[] = [];
      if (fromDate) params.push(`from=${fromDate}`);
      if (toDate) params.push(`to=${toDate}`);
      if (params.length) url += `?${params.join('&')}`;

      console.log('Fetching activity logs from:', url);

      const res = await fetch(url, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const parsed: ActivityLog[] = (data.logs || []).map((d: any) => ({
        id: String(d.id),
        timestamp: new Date(d.timestamp),
        epc: d.epc ?? '',
        objectName: d.objectName ?? '',
        reader: d.reader ?? '',
        antenna: Number(d.antenna ?? 0),
        rssi: Number(d.rssi ?? 0),
        eventType: d.event ?? 'detected',
      }));

      setLogs(parsed);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      toast.error('Failed to load activity logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ================= FILTERING =================
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      log.epc.toLowerCase().includes(term) ||
      log.objectName.toLowerCase().includes(term) ||
      log.reader.toLowerCase().includes(term);

    const matchesReader = filterReader === 'all' || log.reader === filterReader;
    const matchesEvent = filterEvent === 'all' || log.eventType === filterEvent;

    return matchesSearch && matchesReader && matchesEvent;
  });

  // ================= CSV EXPORT =================
  const handleExportCSV = () => {
    if (!filteredLogs.length) {
      toast.warning('No activity logs to export');
      return;
    }

    const header = [
      'Timestamp',
      'Event',
      'EPC',
      'Object Name',
      'Reader',
      'Antenna',
      'RSSI',
    ];

    const rows = filteredLogs.map((log) => [
      log.timestamp.toLocaleString(),
      log.eventType,
      log.epc,
      log.objectName,
      log.reader,
      String(log.antenna),
      String(log.rssi),
    ]);

    const escapeCSV = (value: string) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvContent =
      [header, ...rows]
        .map((row) => row.map(escapeCSV).join(','))
        .join('\r\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];

    link.href = url;
    link.download = `activity-logs-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getEventBadge = (eventType: string) => {
    const variants: Record<string, string> = {
      detected: 'bg-blue-100 text-blue-700',
      moved: 'bg-purple-100 text-purple-700',
      added: 'bg-green-100 text-green-700',
      removed: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={variants[eventType] || ''}>
        {eventType}
      </Badge>
    );
  };

  const formatTime = (date: Date) => date.toLocaleString();

  // ================= UI =================
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Activity Logs</h2>
        <p className="text-slate-600">
          Historical log of all RFID tag detections and events
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by EPC, object name, or reader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterReader} onValueChange={setFilterReader}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Readers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Readers</SelectItem>
                <SelectItem value="Reader-Lab-01">Reader-Lab-01</SelectItem>
                <SelectItem value="Reader-Lab-02">Reader-Lab-02</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="detected">Detected</SelectItem>
                <SelectItem value="moved">Moved</SelectItem>
                <SelectItem value="added">Added</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date Range */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-400" />
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">From:</span>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">To:</span>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>

              <Button variant="outline" onClick={fetchLogs}>
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activity History ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>EPC</TableHead>
                  <TableHead>Object Name</TableHead>
                  <TableHead>Reader</TableHead>
                  <TableHead>Antenna</TableHead>
                  <TableHead>RSSI</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {formatTime(log.timestamp)}
                    </TableCell>
                    <TableCell>{getEventBadge(log.eventType)}</TableCell>
                    <TableCell className="font-mono text-xs">{log.epc}</TableCell>
                    <TableCell>{log.objectName}</TableCell>
                    <TableCell>{log.reader}</TableCell>
                    <TableCell>{log.antenna}</TableCell>
                    <TableCell>{log.rssi} dBm</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No activity logs found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
