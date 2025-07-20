
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
  Activity
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || 'User';

  const metrics = [
    {
      title: "Total Nodes",
      value: "1,247",
      description: "Knowledge entities in your graph",
      icon: Database,
      change: "+12%",
      positive: true
    },
    {
      title: "Total Relationships",
      value: "3,891",
      description: "Connections between entities",
      icon: Network,
      change: "+8%",
      positive: true
    },
    {
      title: "Avg. Relations per Node",
      value: "3.12",
      description: "Average connectivity",
      icon: TrendingUp,
      change: "+0.3",
      positive: true
    },
    {
      title: "Documents Processed",
      value: "156",
      description: "Total documents in knowledge base",
      icon: FileText,
      change: "+5",
      positive: true
    }
  ];

  const quickActions = [
    {
      title: "Upload Documents",
      description: "Add new documents to your knowledge base",
      icon: Upload,
      action: () => console.log("Upload documents")
    },
    {
      title: "Search Knowledge",
      description: "Find information across your documents",
      icon: Search,
      action: () => console.log("Search knowledge")
    },
    {
      title: "View Analytics",
      description: "Explore your knowledge graph insights",
      icon: BarChart3,
      action: () => console.log("View analytics")
    },
    {
      title: "Recent Activity",
      description: "Check latest processing and updates",
      icon: Activity,
      action: () => console.log("Recent activity")
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your knowledge graph and recent activity.
        </p>
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

      {/* Recent Activity Section (Placeholder) */}
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
          <div className="space-y-4">
            {[
              { action: "Document processed", item: "research-paper-2024.pdf", time: "2 hours ago" },
              { action: "Graph updated", item: "Added 23 new relationships", time: "4 hours ago" },
              { action: "Search performed", item: "Query: 'machine learning algorithms'", time: "1 day ago" },
              { action: "Document uploaded", item: "dataset-analysis.docx", time: "2 days ago" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 neural-glass rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.item}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
