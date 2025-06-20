// components/student/submissions/SubmissionDetailsModal.tsx
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  X,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  MessageSquare,
  Download,
  CheckCircle,
  AlertCircle,
  Star,
  User,
} from 'lucide-react';
// import StudentAssignmentService from '@/services/student-assignment-services';
import { StudentSubmission } from '@/interfaces/assignment/assignment-interface';

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: StudentSubmission;
}

const SubmissionDetailsModal: React.FC<SubmissionDetailsModalProps> = ({
  isOpen,
  onClose,
  submission,
}) => {
//   const service = StudentAssignmentService.getInstance();

  const getStatusInfo = () => {
    switch (submission.status) {
      case 'graded':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          text: 'Graded',
          description: 'Assignment has been graded by instructor',
        };
      case 'submitted':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          text: 'Submitted',
          description: 'Waiting for instructor to grade',
        };
      case 'late':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          text: 'Late Submission',
          description: 'Submitted after deadline',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          text: 'Unknown',
          description: 'Status unknown',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const getGradeInfo = () => {
    if (submission.grade !== undefined && submission.assignment?.maxScore) {
      const percentage = ((submission.grade / submission.assignment.maxScore) * 100);
      let gradeColor = 'text-green-600';
      let gradeLabel = 'Excellent';
      
      if (percentage < 60) {
        gradeColor = 'text-red-600';
        gradeLabel = 'Needs Improvement';
      } else if (percentage < 75) {
        gradeColor = 'text-orange-600';
        gradeLabel = 'Good';
      } else if (percentage < 90) {
        gradeColor = 'text-blue-600';
        gradeLabel = 'Very Good';
      }

      return {
        score: `${submission.grade}/${submission.assignment.maxScore}`,
        percentage: percentage.toFixed(1),
        color: gradeColor,
        label: gradeLabel,
      };
    }
    return null;
  };

  const gradeInfo = getGradeInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {submission.assignment?.title || 'Assignment Submission'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Grade Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submission Status */}
            <Card>
              <CardContent className="p-6">
                <div className={`flex items-center space-x-4 p-4 rounded-lg ${statusInfo.bgColor}`}>
                  <div className={`p-2 rounded-full bg-white ${statusInfo.color}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</h3>
                    <p className="text-sm text-gray-600">{statusInfo.description}</p>
                    {submission.isLate && (
                      <Badge className="bg-red-100 text-red-800 mt-1">Late Submission</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grade Information */}
            <Card>
              <CardContent className="p-6">
                {gradeInfo ? (
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${gradeInfo.color} mb-2`}>
                      {gradeInfo.score}
                    </div>
                    <div className={`text-lg ${gradeInfo.color} mb-1`}>
                      {gradeInfo.percentage}%
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Star className={`w-4 h-4 ${gradeInfo.color}`} />
                      <span className={`text-sm font-medium ${gradeInfo.color}`}>
                        {gradeInfo.label}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Not Graded Yet</p>
                    <p className="text-sm">Waiting for instructor review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submission Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Submitted At</p>
                <p className="font-semibold">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">
                  {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-gray-600">Assignment Due</p>
                <p className="font-semibold">
                  {submission.assignment?.dueDate 
                    ? new Date(submission.assignment.dueDate).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
                {submission.assignment?.maxScore && (
                  <p className="text-xs text-gray-500">Max: {submission.assignment.maxScore} pts</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm text-gray-600">Submission Type</p>
                <p className="font-semibold">
                  {submission.submissionText && submission.submissionFiles?.length 
                    ? 'Text + Files'
                    : submission.submissionText 
                    ? 'Text Only'
                    : 'Files Only'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Information */}
          {submission.assignment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Assignment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Title:</p>
                    <p>{submission.assignment.title}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Due Date:</p>
                    <p>{new Date(submission.assignment.dueDate).toLocaleDateString()} at {new Date(submission.assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Maximum Score:</p>
                    <p>{submission.assignment.maxScore} points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submitted Content */}
          {submission.submissionText && (
            <Card>
              <CardHeader>
                <CardTitle>Submitted Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{submission.submissionText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submitted Files */}
          {submission.submissionFiles && submission.submissionFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Submitted Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {submission.submissionFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{file}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Faculty Feedback */}
          {submission.feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Instructor Feedback</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{submission.feedback}</p>
                  {submission.updatedAt && (
                    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-blue-200">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Graded on: {new Date(submission.updatedAt).toLocaleDateString()} at {new Date(submission.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Feedback Message */}
          {submission.status === 'graded' && !submission.feedback && (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Provided</h3>
                <p className="text-gray-500">The instructor has graded this assignment but did not provide written feedback.</p>
              </CardContent>
            </Card>
          )}

          {/* Pending Review Message */}
          {submission.status === 'submitted' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">Under Review</h3>
                <p className="text-blue-700">Your submission is being reviewed by the instructor. You will be notified when grading is complete.</p>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailsModal;