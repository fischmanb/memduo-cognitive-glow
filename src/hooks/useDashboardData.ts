import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface DashboardMetrics {
  totalNodes: number;
  totalRelationships: number;
  avgRelationsPerNode: number;
  documentsProcessed: number;
  userSpecific?: boolean;
  userEmail?: string;
}

interface RecentActivity {
  action: string;
  item: string;
  time: string;
}

export const useDashboardData = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching dashboard data...');

        // First, let's try to get the current user info to see what ID format backend expects
        let currentUser = null;
        try {
          currentUser = await apiClient.getCurrentUser();
          console.log('✅ Current user info:', currentUser);
        } catch (userError) {
          console.log('⚠️ Could not get current user info:', userError);
        }

        // Fetch real data from backend - with better error handling
        let documents = [];
        let graphStats = null;

        try {
          const documentsResponse = await apiClient.getDocuments() as any;
          documents = documentsResponse.documents || [];
          console.log('✅ Documents fetched:', documents.length);
        } catch (docError) {
          console.log('⚠️ Documents endpoint not available or empty:', docError);
          documents = [];
        }

        try {
          // Try to get user-specific data first
          const userEmail = localStorage.getItem('memduo_user_email');
          console.log('🔍 Stored user email:', userEmail);
          console.log('🔍 Current user from backend:', currentUser);
          
          let userStats = null;
          
          // Try multiple user identifier formats
          const userIdentifiers = [
            userEmail, // Email format
            currentUser?.id, // Backend user ID if available
            currentUser?.user_id, // Alternative user ID field
            currentUser?.sub, // JWT subject
          ].filter(Boolean); // Remove null/undefined values
          
          console.log('🔍 Trying user identifiers:', userIdentifiers);
          
          for (const userId of userIdentifiers) {
            if (!userId) continue;
            
            try {
              console.log(`🔍 Trying user-specific graph stats for: ${userId}`);
              userStats = await apiClient.getUserMemoryStats(userId);
              console.log(`✅ User-specific graph stats found for ${userId}:`, userStats);
              
              if (userStats && (userStats.totalNodes > 0 || userStats.totalRelationships > 0)) {
                userStats.userSpecific = true;
                userStats.userEmail = userEmail;
                graphStats = userStats;
                break; // Found data, stop trying other identifiers
              }
            } catch (userError) {
              console.log(`⚠️ User-specific graph stats not available for ${userId}:`, userError);
            }
          }
          
          // Fallback to global stats if no user-specific data
          if (!graphStats) {
            const globalStats = await apiClient.getMemoryStats();
            console.log('✅ Global graph stats fetched:', globalStats);
            
            if (globalStats) {
              graphStats = {
                ...globalStats,
                userSpecific: false,
                userEmail: userEmail
              };
            }
          }
        } catch (statsError) {
          console.log('⚠️ Graph stats endpoint not available:', statsError);
          graphStats = null;
        }

        // Calculate real metrics based on actual data
        const documentsCount = documents.length;
        const nodesCount = graphStats?.totalNodes || 0;
        const relationshipsCount = graphStats?.totalRelationships || 0;
        
        // For now, use basic calculations - these can be enhanced when backend provides more detailed metrics
        const calculatedMetrics: DashboardMetrics = {
          totalNodes: nodesCount,
          totalRelationships: relationshipsCount,
          avgRelationsPerNode: nodesCount > 0 ? Number((relationshipsCount / nodesCount).toFixed(2)) : 0,
          documentsProcessed: documentsCount,
          userSpecific: graphStats?.userSpecific,
          userEmail: graphStats?.userEmail
        };

        setMetrics(calculatedMetrics);

        // Create recent activity from actual data
        const activity: RecentActivity[] = [];
        
        // Add document-based activities
        documents.slice(0, 3).forEach((doc: any) => {
          activity.push({
            action: "Document processed",
            item: doc.filename || doc.title || `Document ${doc.id}`,
            time: formatTimeAgo(doc.created_at || doc.processed_at)
          });
        });

        // Add graph-based activity if we have stats
        if (graphStats && (graphStats.totalNodes > 0 || graphStats.totalRelationships > 0)) {
          activity.push({
            action: "Knowledge graph updated",
            item: `${graphStats.totalNodes} nodes, ${graphStats.totalRelationships} relationships`,
            time: "Recently"
          });
        }

        // If no real activity, show that system is ready
        if (activity.length === 0) {
          activity.push({
            action: "System ready",
            item: "No recent activity - ready for your first upload",
            time: "Now"
          });
        }

        setRecentActivity(activity);
        console.log('✅ Dashboard data loaded successfully');
      } catch (err) {
        console.error('❌ Failed to fetch dashboard data:', err);
        
        // Don't set error for empty data - only for actual failures
        if (err instanceof Error && !err.message.includes('404')) {
          setError(`Unable to connect to backend: ${err.message}`);
        }
        
        // Set default values when API fails
        setMetrics({
          totalNodes: 0,
          totalRelationships: 0,
          avgRelationsPerNode: 0,
          documentsProcessed: 0
        });
        setRecentActivity([
          {
            action: "System ready",
            item: "Ready to process your first documents",
            time: "Now"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { metrics, recentActivity, loading, error };
};

// Helper function to format timestamps
const formatTimeAgo = (timestamp: string | null): string => {
  if (!timestamp) return "Unknown time";
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  } catch {
    return "Unknown time";
  }
};