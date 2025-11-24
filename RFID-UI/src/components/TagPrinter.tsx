import { useState } from 'react';
import { Printer, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface PrintJob {
  id: string;
  objectName: string;
  epc: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

const mockPrintHistory: PrintJob[] = [
  {
    id: '1',
    objectName: 'Robotic Arm Controller',
    epc: 'E2801170000002037E53B1C0',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '2',
    objectName: 'Sensor Kit Box',
    epc: 'E2801170000002037E53B2D1',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'completed'
  },
  {
    id: '3',
    objectName: 'Power Supply Unit',
    epc: 'E2801170000002037E53B3E2',
    timestamp: new Date(Date.now() - 120 * 60 * 1000),
    status: 'completed'
  }
];

export function TagPrinter() {
  const [printerStatus] = useState<'online' | 'offline'>('online');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [printHistory] = useState<PrintJob[]>(mockPrintHistory);

  const handleTestPrint = () => {
    toast.success('Test label sent to printer');
  };

  const handlePrint = () => {
    toast.success('Print job queued successfully');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Tag Printer</h2>
        <p className="text-slate-600">Print RFID labels for tagged objects</p>
      </div>

      {/* Printer Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Printer Status</CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${printerStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-slate-600">
                {printerStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-slate-500">Printer Model</div>
              <div className="text-slate-900">Zebra ZT411 RFID</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Connection</div>
              <div className="text-slate-900">Network (192.168.1.100)</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Labels Remaining</div>
              <div className="text-slate-900">~450 labels</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Print Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="template">Label Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger id="template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Label (50mm x 25mm)</SelectItem>
                  <SelectItem value="large">Large Label (75mm x 50mm)</SelectItem>
                  <SelectItem value="compact">Compact Label (40mm x 20mm)</SelectItem>
                  <SelectItem value="custom">Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Label Preview */}
            <div className="space-y-2">
              <Label>Label Preview</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-white">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">RoboAI Laboratory</div>
                    <div className="text-slate-900">Object Name Here</div>
                  </div>
                  <div className="border border-slate-300 rounded p-2 bg-slate-50">
                    <div className="text-xs text-center font-mono">EPC: E280117...</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="border border-slate-300 px-4 py-2 rounded bg-white">
                      <div className="text-xs text-slate-500 text-center">QR Code</div>
                    </div>
                  </div>
                  <div className="text-xs text-center text-slate-500">
                    Date: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Print Label
              </Button>
              <Button onClick={handleTestPrint} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Test Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Print Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {printHistory.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-slate-900">{job.objectName}</div>
                    <div className="text-sm text-slate-500 font-mono">{job.epc}</div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(job.status)}
                  <div className="text-xs text-slate-500 mt-1">
                    {job.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
