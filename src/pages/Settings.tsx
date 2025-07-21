import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon,
  User,
  Brain,
  Shield,
  Database,
  Bell,
  Palette,
  Download,
  Trash2,
  AlertCircle,
  Info,
  Save
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { user, isBackendAuth, backendUser } = useAuth();
  const { toast } = useToast();
  
  // User Profile Settings
  const [machineName, setMachineName] = useState(backendUser?.machine_name || '');
  const [displayName, setDisplayName] = useState(backendUser?.name || user?.user_metadata?.first_name || '');
  
  // AI Personalization Settings
  const [contradictionTolerance, setContradictionTolerance] = useState([0.7]);
  const [beliefSensitivity, setBeliefSensitivity] = useState('moderate');
  const [salienceDecaySpeed, setSalienceDecaySpeed] = useState('default');
  
  // System Settings
  const [autoIndexDocuments, setAutoIndexDocuments] = useState(true);
  const [enableContradictionAlerts, setEnableContradictionAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // Privacy Settings
  const [dataRetention, setDataRetention] = useState('365');
  const [shareAnonymousData, setShareAnonymousData] = useState(false);

  const handleSaveProfile = async () => {
    try {
      // This would typically call an API to update user profile
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile settings.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAISettings = async () => {
    try {
      // This would typically call an API to update AI personalization settings
      toast({
        title: "AI Settings Updated",
        description: "Your AI personalization settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update AI settings.",
        variant: "destructive"
      });
    }
  };

  const handleExportData = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Your data export will be ready shortly.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAllData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    try {
      toast({
        title: "Data Deletion Started",
        description: "Your data is being permanently deleted.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Customize your MemDuo experience and AI behavior
            </p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <Card className="neural-glass-premium">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-400" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your personal information and account preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="neural-glass"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="machineName" className="text-white">AI Assistant Name</Label>
              <Input
                id="machineName"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="What should I call myself?"
                className="neural-glass"
              />
              <p className="text-xs text-gray-400">
                This is what your AI assistant will call itself in conversations
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Account Information</Label>
            <div className="p-4 neural-glass rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user?.email || backendUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Access Level:</span>
                <span className="text-white">{isBackendAuth ? 'Full Backend Access' : 'Demo Access'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-mono text-xs">{user?.id || backendUser?.id}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="neural-glass-premium">
            <Save className="mr-2 h-4 w-4" />
            Save Profile Changes
          </Button>
        </CardContent>
      </Card>

      {/* AI Personalization */}
      <Card className="neural-glass-premium">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="mr-2 h-5 w-5 text-purple-400" />
            AI Personalization
          </CardTitle>
          <CardDescription>
            Configure how your AI assistant behaves and processes information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-white flex items-center">
                Contradiction Tolerance
                <Info className="ml-2 h-4 w-4 text-gray-400" />
              </Label>
              <Slider
                value={contradictionTolerance}
                onValueChange={setContradictionTolerance}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Low (Challenge everything)</span>
                <span>Current: {contradictionTolerance[0].toFixed(1)}</span>
                <span>High (Accept most inputs)</span>
              </div>
              <p className="text-xs text-gray-400">
                Controls how readily the AI accepts potentially contradictory information
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Belief Sensitivity</Label>
              <Select value={beliefSensitivity} onValueChange={setBeliefSensitivity}>
                <SelectTrigger className="neural-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Question assumptions frequently</SelectItem>
                  <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                  <SelectItem value="high">High - Accept beliefs readily</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                How sensitive the AI is to challenges to existing beliefs
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-white">Memory Decay Speed</Label>
              <Select value={salienceDecaySpeed} onValueChange={setSalienceDecaySpeed}>
                <SelectTrigger className="neural-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow - Retain information longer</SelectItem>
                  <SelectItem value="default">Default - Balanced retention</SelectItem>
                  <SelectItem value="fast">Fast - Prioritize recent information</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                How quickly older information becomes less influential
              </p>
            </div>
          </div>

          <Button onClick={handleSaveAISettings} className="neural-glass-premium">
            <Save className="mr-2 h-4 w-4" />
            Save AI Settings
          </Button>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card className="neural-glass-premium">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="mr-2 h-5 w-5 text-emerald-400" />
            System Preferences
          </CardTitle>
          <CardDescription>
            Configure system behavior and automation settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Auto-Index Documents</Label>
                <p className="text-xs text-gray-400">
                  Automatically process uploaded documents for search
                </p>
              </div>
              <Switch 
                checked={autoIndexDocuments} 
                onCheckedChange={setAutoIndexDocuments}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Contradiction Alerts</Label>
                <p className="text-xs text-gray-400">
                  Notify when contradictory information is detected
                </p>
              </div>
              <Switch 
                checked={enableContradictionAlerts} 
                onCheckedChange={setEnableContradictionAlerts}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Email Notifications</Label>
                <p className="text-xs text-gray-400">
                  Receive email updates about processing and alerts
                </p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Dark Mode</Label>
                <p className="text-xs text-gray-400">
                  Use dark theme for the interface
                </p>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card className="neural-glass-premium">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="mr-2 h-5 w-5 text-yellow-400" />
            Privacy & Data Management
          </CardTitle>
          <CardDescription>
            Control your data privacy and retention settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-white">Data Retention Period</Label>
              <Select value={dataRetention} onValueChange={setDataRetention}>
                <SelectTrigger className="neural-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                How long to keep your chat history and document data
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Share Anonymous Usage Data</Label>
                <p className="text-xs text-gray-400">
                  Help improve MemDuo by sharing anonymous usage statistics
                </p>
              </div>
              <Switch 
                checked={shareAnonymousData} 
                onCheckedChange={setShareAnonymousData}
              />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Data Management</h3>
            
            <div className="space-y-3">
              <Button
                onClick={handleExportData}
                variant="outline"
                className="w-full neural-glass-hover"
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
              <p className="text-xs text-gray-400">
                Download a copy of all your data including documents, chats, and settings
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDeleteAllData}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Data
              </Button>
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">
                  This will permanently delete all your documents, chat history, and account data. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;