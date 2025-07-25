
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Database, 
  Network, 
  TrendingUp, 
  FileText,
  Upload,
  Search,
  BarChart3,
  Activity,
  Shield,
  Loader2
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { user, isBackendAuth, backendUser, email } = useAuth();
  const { metrics: dashboardMetrics, recentActivity, loading, error } = useDashboardData();
  
  // Determine display name based on auth mode
  let displayName = 'User';
  let authMode = 'Unknown';
  let userEmail = email;
  
  if (isBackendAuth && backendUser) {
    displayName = backendUser.name || backendUser.email || email || 'Backend User';
    authMode = 'Backend Access';
    userEmail = email || backendUser.email;
  } else if (user) {
    displayName = user.user_metadata?.first_name || user.email || 'User';
    authMode = 'Supabase Auth';
    userEmail = user.email;
  }

  // Create metrics array with real data
  const metrics = [
    {
      title: "Total Nodes",
      value: loading ? "Loading..." : dashboardMetrics?.totalNodes.toLocaleString() || "0",
      description: "Knowledge entities in your graph",
      icon: Database,
      change: dashboardMetrics?.totalNodes ? "Active" : "Ready",
      positive: true
    },
    {
      title: "Total Relationships", 
      value: loading ? "Loading..." : dashboardMetrics?.totalRelationships.toLocaleString() || "0",
      description: "Connections between entities",
      icon: Network,
      change: dashboardMetrics?.totalRelationships ? "Active" : "Ready",
      positive: true
    },
    {
      title: "Avg. Relations per Node",
      value: loading ? "Loading..." : dashboardMetrics?.avgRelationsPerNode.toString() || "0",
      description: "Average connectivity",
      icon: TrendingUp,
      change: dashboardMetrics?.avgRelationsPerNode ? "Calculated" : "Ready",
      positive: true
    },
    {
      title: "Documents Processed",
      value: loading ? "Loading..." : dashboardMetrics?.documentsProcessed.toLocaleString() || "0",
      description: "Total documents in knowledge base",
      icon: FileText,
      change: dashboardMetrics?.documentsProcessed ? "Active" : "Ready",
      positive: true
    }
  ];

  const quickActions = [
    {
      title: "Upload Documents",
      description: "Add new documents to your knowledge base",
      icon: Upload,
      action: () => console.log("Upload documents"),
      available: true
    },
    {
      title: "Search Knowledge",
      description: "Find information across your documents",
      icon: Search,
      action: () => console.log("Search knowledge"),
      available: true
    },
    {
      title: "View Analytics",
      description: "Explore your knowledge graph insights",
      icon: BarChart3,
      action: () => console.log("View analytics"),
      available: true
    },
    {
      title: "Recent Activity",
      description: "Check latest processing and updates",
      icon: Activity,
      action: () => console.log("Recent activity"),
      available: true
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Auth Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
              Welcome back, {displayName}!
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your knowledge graph and recent activity.
            </p>
          </div>
          
          {/* Auth Mode Indicator */}
          <div className="flex items-center space-x-2 neural-glass px-4 py-2 rounded-lg">
            {isBackendAuth ? (
              <Shield className="h-4 w-4 text-green-400" />
            ) : (
              <Database className="h-4 w-4 text-blue-400" />
            )}
            <span className="text-sm font-medium text-white">{authMode}</span>
          </div>
        </div>

        {/* Auth Mode Info */}
        {isBackendAuth && (
          <div className="neural-glass p-4 rounded-lg border-l-4 border-green-400">
            <p className="text-green-200 text-sm">
              <strong>Backend Access:</strong> Full access to MemDuo API and features.
            </p>
          </div>
        )}

        {/* Data Scope Indicator */}
        {!loading && userEmail && (
          <div className="neural-glass p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">
                  <strong>Data Scope:</strong> {dashboardMetrics?.userSpecific ? 'Personal' : 'Global'} • User: {userEmail}
                </p>
                {dashboardMetrics?.userSpecific === false && (
                  <p className="text-amber-200 text-xs mt-1">
                    Currently showing global system data. User-specific data not available.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card 
            key={metric.title} 
            className="neural-glass-premium neural-glass-hover transform-gpu"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {metric.value}
              </div>
              <p className="text-xs text-gray-400 mb-2">
                {metric.description}
              </p>
              <div className={`text-xs flex items-center ${
                metric.positive ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {metric.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card 
              key={action.title}
              className="neural-glass neural-glass-hover cursor-pointer transform-gpu"
              onClick={action.action}
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg neural-glass">
                    <action.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-white">
                      {action.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-400 text-sm">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <Card className="neural-glass-premium">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-emerald-400" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates and processing in your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400 mr-2" />
              <span className="text-gray-400">Loading recent activity...</span>
            </div>
          ) : error ? (
            <div className="p-4 neural-glass rounded-lg border-l-4 border-red-400">
              <p className="text-red-200 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 neural-glass rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">{activity.action}</p>
                    <p className="text-xs text-gray-400">{activity.item}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
