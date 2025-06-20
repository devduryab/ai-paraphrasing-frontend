// components/students/submissions/StudentSubmissionsTable.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Eye,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  Download,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { StudentSubmission } from '@/interfaces/assignment/assignment-interface';
import SubmissionDetailsModal from './SubmissionDetailsModal';
import StudentAssignmentService from '@/services/student-assignment-services';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card>
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

const StudentSubmissionsTable: React.FC = () => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const service = StudentAssignmentService.getInstance();

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedSubmissions = await service.getMySubmissions();
      setSubmissions(fetchedSubmissions);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      setError(error.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(submission =>
        submission.assignment?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }

    // Sort by submission date (most recent first)
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    setFilteredSubmissions(filtered);
  };

  const getStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.status === 'graded').length;
    const pending = submissions.filter(s => s.status === 'submitted').length;
    const late = submissions.filter(s => s.isLate).length;
    
    const gradedWithScores = submissions.filter(s => s.grade !== undefined && s.assignment?.maxScore);
    const averageGrade = gradedWithScores.length > 0 
      ? gradedWithScores.reduce((sum, s) => sum + ((s.grade! / s.assignment!.maxScore) * 100), 0) / gradedWithScores.length
      : 0;

    return { total, graded, pending, late, averageGrade };
  };

  const stats = getStats();

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (isLate && status === 'submitted') {
      return <Badge className="bg-orange-100 text-orange-800">Late Submitted</Badge>;
    }
    
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800">Late</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getGradeDisplay = (submission: StudentSubmission) => {
    if (submission.grade !== undefined && submission.assignment?.maxScore) {
      const percentage = ((submission.grade / submission.assignment.maxScore) * 100).toFixed(1);
      return (
        <div className="text-center">
          <div className="font-semibold">{submission.grade}/{submission.assignment.maxScore}</div>
          <div className="text-sm text-gray-500">{percentage}%</div>
        </div>
      );
    }
    return <span className="text-gray-500">Not graded</span>;
  };

  const handleViewDetails = (submission: StudentSubmission) => {
    setSelectedSubmission(submission);
    setDetailsModalOpen(true);
  };

  const exportSubmissions = () => {
    const csvContent = [
      ['Assignment', 'Course', 'Submitted At', 'Status', 'Grade', 'Late'].join(','),
      ...filteredSubmissions.map(submission => [
        submission.assignment?.title || 'N/A',
        'N/A', // Course name would need to be added to the data structure
        new Date(submission.submittedAt).toLocaleDateString(),
        submission.status,
        submission.grade !== undefined ? `${submission.grade}/${submission.assignment?.maxScore}` : 'Not graded',
        submission.isLate ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-submissions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Submissions</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadSubmissions}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Submissions"
          value={stats.total}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatsCard
          title="Graded"
          value={stats.graded}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatsCard
          title="Average Grade"
          value={Math.round(stats.averageGrade)}
          icon={TrendingUp}
          color="bg-purple-500"
          subtitle={stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : 'No grades yet'}
        />
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>My Submissions</span>
            </CardTitle>
            <Button variant="outline" onClick={exportSubmissions} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by assignment title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more submissions.'
                  : 'You haven\'t submitted any assignments yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.assignment?.title || 'Unknown Assignment'}</div>
                          <div className="text-sm text-gray-500">
                            Due: {submission.assignment?.dueDate ? new Date(submission.assignment.dueDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(submission.submittedAt).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status, submission.isLate)}
                      </TableCell>
                      <TableCell>
                        {getGradeDisplay(submission)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {submission.feedback ? (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm">Available</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">No feedback</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(submission)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <SubmissionDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          submission={selectedSubmission}
        />
      )}
    </div>
  );
};

export default StudentSubmissionsTable;