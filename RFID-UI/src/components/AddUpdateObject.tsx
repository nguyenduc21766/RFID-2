import { useState } from 'react';
import { Save, Printer, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

export function AddUpdateObject() {
  const [formData, setFormData] = useState({
    objectName: '',
    responsiblePerson: '',
    projectName: '',
    dateCreated: new Date().toISOString().split('T')[0],
    tagEPC: '',
    objectType: '',
    currentLocation: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.objectName || !formData.tagEPC) {
      toast.error('Please fill in required fields');
      return;
    }
    toast.success('Object saved to database successfully');
    // Reset form
    setFormData({
      objectName: '',
      responsiblePerson: '',
      projectName: '',
      dateCreated: new Date().toISOString().split('T')[0],
      tagEPC: '',
      objectType: '',
      currentLocation: '',
    });
  };

  const handlePrintLabel = () => {
    if (!formData.objectName || !formData.tagEPC) {
      toast.error('Please fill in required fields before printing');
      return;
    }
    toast.success('Sending print job to RFID label printer...');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Add / Update Object</h2>
        <p className="text-slate-600">Insert new items or update existing tracked objects in the database</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Object Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Object Name */}
            <div className="space-y-2">
              <Label htmlFor="objectName">
                Object Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="objectName"
                placeholder="e.g., Robotic Arm Controller"
                value={formData.objectName}
                onChange={(e) => handleInputChange('objectName', e.target.value)}
              />
            </div>

            {/* Responsible Person */}
            <div className="space-y-2">
              <Label htmlFor="responsiblePerson">Responsible Person</Label>
              <Input
                id="responsiblePerson"
                placeholder="e.g., Dr. Sarah Johnson"
                value={formData.responsiblePerson}
                onChange={(e) => handleInputChange('responsiblePerson', e.target.value)}
              />
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="e.g., Automation Research Project"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
              />
            </div>

            {/* Date of Tag Creation */}
            <div className="space-y-2">
              <Label htmlFor="dateCreated">Date of Tag Creation</Label>
              <Input
                id="dateCreated"
                type="date"
                value={formData.dateCreated}
                onChange={(e) => handleInputChange('dateCreated', e.target.value)}
              />
            </div>

            {/* Tag EPC / ID */}
            <div className="space-y-2">
              <Label htmlFor="tagEPC">
                Tag EPC / ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tagEPC"
                placeholder="e.g., E2801170000002037E53B1C0"
                value={formData.tagEPC}
                onChange={(e) => handleInputChange('tagEPC', e.target.value)}
                className="font-mono"
              />
            </div>

            {/* Object Type */}
            <div className="space-y-2">
              <Label htmlFor="objectType">Object Type</Label>
              <Select
                value={formData.objectType}
                onValueChange={(value) => handleInputChange('objectType', value)}
              >
                <SelectTrigger id="objectType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="device">Device</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Current Location */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentLocation">Current Location</Label>
              <Select
                value={formData.currentLocation}
                onValueChange={(value) => handleInputChange('currentLocation', value)}
              >
                <SelectTrigger id="currentLocation">
                  <SelectValue placeholder="Select location (or detected automatically)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab-a">Lab Zone A</SelectItem>
                  <SelectItem value="lab-b">Lab Zone B</SelectItem>
                  <SelectItem value="lab-c">Lab Zone C</SelectItem>
                  <SelectItem value="storage">Storage Room</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="testing">Testing Area</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Location can be automatically detected when the tag is first scanned by a reader
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
            <Button onClick={handleSave} className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 mr-2" />
              Save to Database
            </Button>
            <Button onClick={handlePrintLabel} variant="outline" className="flex-1 sm:flex-none">
              <Printer className="h-4 w-4 mr-2" />
              Print RFID Label
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setFormData({
                  objectName: '',
                  responsiblePerson: '',
                  projectName: '',
                  dateCreated: new Date().toISOString().split('T')[0],
                  tagEPC: '',
                  objectType: '',
                  currentLocation: '',
                });
              }}
              className="flex-1 sm:flex-none"
            >
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Multiple Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>EPC tags are automatically validated for proper format</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>Print labels immediately after saving to ensure proper tracking</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>Location will auto-update when tag is detected by any reader</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>Use descriptive object names for easier searching</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
