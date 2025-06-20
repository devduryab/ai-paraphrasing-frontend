// components/student/dashboard/StudentDashboardContent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Eye,
  Upload,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Assignment, StudentAnalytics } from '@/interfaces/assignment/assignment-interface';
import StudentAssignmentService from '@/services/student-assignment-services';

interface QuickStatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  onClick 
}) => (
  <Card className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface UpcomingAssignmentCardProps {
  assignment: Assignment;
  onViewDetails: (assignment: Assignment) => void;
  onSubmit: (assignment: Assignment) => void;
}

const UpcomingAssignmentCard: React.FC<UpcomingAssignmentCardProps> = ({
  assignment,
  onViewDetails,
  onSubmit,
}) => {
  const service = StudentAssignmentService.getInstance();
  const isOverdue = service.isAssignmentOverdue(assignment.dueDate);
  const timeLeft = service.getTimeUntilDue(assignment.dueDate);
  const hasSubmission = assignment.mySubmission;

  const getPriorityColor = () => {
    const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (isOverdue) return 'border-red-500 bg-red-50';
    if (daysLeft <= 1) return 'border-orange-500 bg-orange-50';
    if (daysLeft <= 3) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <Card className={`${getPriorityColor()} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{assignment.title}</h4>
            <p className="text-xs text-gray-600 mb-1">{assignment.status}</p>
          </div>
          <div className="text-right">
            {hasSubmission ? (
              <Badge className={service.getSubmissionStatusColor(hasSubmission.status)}>
                {hasSubmission.status.replace('_', ' ')}
              </Badge>
            ) : isOverdue ? (
              <Badge className="bg-red-100 text-red-800">Overdue</Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
            <Clock className="w-3 h-3" />
            <span>{timeLeft}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(assignment)}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          
          {!hasSubmission && (
            <Button
              size="sm"
              onClick={() => onSubmit(assignment)}
              disabled={isOverdue && !assignment.allowLateSubmission}
              className="flex-1 text-xs"
            >
              <Upload className="w-3 h-3 mr-1" />
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface RecentSubmissionCardProps {
  submission: any; // StudentSubmission type
}

const RecentSubmissionCard: React.FC<RecentSubmissionCardProps> = ({ submission }) => {
  const service = StudentAssignmentService.getInstance();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{submission.assignment?.title || 'Unknown Assignment'}</h4>
            <p className="text-xs text-gray-500">
              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={service.getSubmissionStatusColor(submission.status)}>
            {submission.status.replace('_', ' ')}
          </Badge>
        </div>

        {submission.grade !== undefined && submission.assignment?.maxScore && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Grade:</span>
            <span className="font-semibold">
              {service.formatGrade(submission.grade, submission.assignment.maxScore)}
            </span>
          </div>
        )}

        {submission.feedback && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
            <div className="flex items-center space-x-1 text-blue-600 mb-1">
              <FileText className="w-3 h-3" />
              <span>Feedback available</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const StudentDashboardContent: React.FC = () => {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const service = StudentAssignmentService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load analytics
      const analyticsData = await service.getStudentAnalytics();
      setAnalytics(analyticsData);
      
      // Load upcoming assignments (next 5)
      const assignments = await service.getStudentAssignments({ status: 'active' });
      const upcoming = assignments
        .filter(a => !a.mySubmission || a.mySubmission.status !== 'graded')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      setUpcomingAssignments(upcoming);
      
      // Load recent submissions (last 3)
      const submissions = await service.getMySubmissions();
      const recent = submissions
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 3);
      setRecentSubmissions(recent);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAssignmentDetails = (assignment: Assignment) => {
    // This would open the assignment details modal
    // For now, navigate to assignments page
    window.location.href = '/student/assignments';
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    // This would open the submission modal
    // For now, navigate to assignments page
    window.location.href = '/student/assignments';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/student/assignments">
            <QuickStatsCard
              title="Total Assignments"
              value={analytics.totalAssignments}
              icon={BookOpen}
              color="bg-blue-500"
            />
          </Link>
          
          <Link href="/student/submissions">
            <QuickStatsCard
              title="Submitted"
              value={analytics.submittedAssignments}
              icon={CheckCircle}
              color="bg-green-500"
            />
          </Link>
          
          <QuickStatsCard
            title="Pending"
            value={analytics.pendingAssignments}
            icon={Clock}
            color="bg-yellow-500"
            onClick={() => window.location.href = '/student/assignments'}
          />
          
          <QuickStatsCard
            title="Average Grade"
            value={Math.round(analytics.averageGrade)}
            icon={TrendingUp}
            color="bg-purple-500"
            subtitle={analytics.averageGrade > 0 ? `${analytics.averageGrade.toFixed(1)}%` : 'No grades yet'}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span>Upcoming Assignments</span>
              </CardTitle>
              <Link href="/student/assignments">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500">You don&apos;t have any pending assignments.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map((assignment) => (
                  <UpcomingAssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    onViewDetails={handleViewAssignmentDetails}
                    onSubmit={handleSubmitAssignment}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Recent Submissions</span>
              </CardTitle>
              <Link href="/student/submissions">
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                <p className="text-gray-500">Start by submitting your first assignment!</p>
                <Link href="/student/assignments">
                  <Button className="mt-4">
                    View Assignments
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <RecentSubmissionCard
                    key={submission._id}
                    submission={submission}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      {analytics && analytics.averageGrade > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span>Performance Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analytics.averageGrade.toFixed(1)}%
                </div>
                <p className="text-gray-600">Overall Average</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round((analytics.submittedAssignments / analytics.totalAssignments) * 100)}%
                </div>
                <p className="text-gray-600">Completion Rate</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analytics.gradedAssignments}
                </div>
                <p className="text-gray-600">Graded Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/student/assignments">
              <Button variant="outline" className="w-full flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>View All Assignments</span>
              </Button>
            </Link>
            
            <Link href="/student/submissions">
              <Button variant="outline" className="w-full flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>My Submissions</span>
              </Button>
            </Link>
            
            <Link href="/student/courses">
              <Button variant="outline" className="w-full flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Enroll in Courses</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboardContent;