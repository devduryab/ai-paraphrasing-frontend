// components/admin/courses/CreateCourseModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreateCourseData, FacultyMember } from "@/interfaces/course/course-interface";
import CourseService from "@/services/course-management-services";
import { cn } from "@/lib/utils";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateCourseData>({
    name: "",
    maxSlots: 30,
    assignedFaculty: [],
    status: "active",
  });
  const [availableFaculty, setAvailableFaculty] = useState<FacultyMember[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingFaculty, setFetchingFaculty] = useState(false);

  const courseService = CourseService.getInstance();

  useEffect(() => {
    if (isOpen) {
      fetchAvailableFaculty();
    }
  }, [isOpen]);

  const fetchAvailableFaculty = async () => {
    try {
      setFetchingFaculty(true);
      const faculty = await courseService.getAvailableFaculty();
      setAvailableFaculty(faculty);
    } catch (error) {
      console.error("Error fetching faculty:", error);
    } finally {
      setFetchingFaculty(false);
    }
  };

  const handleInputChange = (field: keyof CreateCourseData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFacultySelect = (facultyId: string) => {
    if (!selectedFacultyIds.includes(facultyId)) {
      const newSelection = [...selectedFacultyIds, facultyId];
      setSelectedFacultyIds(newSelection);
      setFormData(prev => ({
        ...prev,
        assignedFaculty: newSelection,
      }));
    }
  };

  const removeFaculty = (facultyId: string) => {
    const newSelection = selectedFacultyIds.filter(id => id !== facultyId);
    setSelectedFacultyIds(newSelection);
    setFormData(prev => ({
      ...prev,
      assignedFaculty: newSelection,
    }));
  };

  const getSelectedFaculty = () => {
    return availableFaculty.filter(faculty => 
      selectedFacultyIds.includes(faculty._id)
    );
  };

  const getAvailableFacultyForDropdown = () => {
    return availableFaculty.filter(faculty => 
      !selectedFacultyIds.includes(faculty._id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Course name is required");
      return;
    }

    if (formData.assignedFaculty.length === 0) {
      alert("At least one faculty member must be assigned");
      return;
    }

    if (formData.maxSlots < 1) {
      alert("Maximum slots must be at least 1");
      return;
    }

    try {
      setLoading(true);
      await courseService.createCourse(formData);
      
      // Reset form
      setFormData({
        name: "",
        maxSlots: 30,
        assignedFaculty: [],
        status: "active",
      });
      setSelectedFacultyIds([]);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating course:", error);
      alert(error.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setFormData({
        name: "",
        maxSlots: 30,
        assignedFaculty: [],
        status: "active",
      });
      setSelectedFacultyIds([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn("!max-w-[30vw] !w-[90vw] max-h-[85vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name */}
          <div>
            <Label htmlFor="name">Course Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Physics, Mathematics"
              required
              disabled={loading}
            />
          </div>

          {/* Maximum Slots */}
          <div>
            <Label htmlFor="maxSlots">Maximum Slots *</Label>
            <Input
              id="maxSlots"
              type="number"
              min="1"
              max="1000"
              value={formData.maxSlots}
              onChange={(e) => handleInputChange("maxSlots", parseInt(e.target.value) || 1)}
              required
              disabled={loading}
            />
          </div>

          {/* Assign Faculty */}
          <div>
            <Label>Assign Faculty *</Label>
            
            {/* Selected Faculty */}
            {selectedFacultyIds.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600">Selected Faculty:</p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedFaculty().map((faculty) => (
                    <Badge
                      key={faculty._id}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <UserCheck className="w-3 h-3" />
                      {faculty.profile.firstName} {faculty.profile.lastName}
                      <button
                        type="button"
                        onClick={() => removeFaculty(faculty._id)}
                        className="ml-1 hover:text-red-600"
                        disabled={loading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Faculty Dropdown */}
            <div className="mt-2">
              <Select
                onValueChange={handleFacultySelect}
                disabled={loading || fetchingFaculty}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      fetchingFaculty 
                        ? "Loading faculty..." 
                        : getAvailableFacultyForDropdown().length === 0
                        ? "No more faculty available"
                        : "Select faculty to assign"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableFacultyForDropdown().map((faculty) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.profile.firstName} {faculty.profile.lastName}
                      <span className="text-gray-500 ml-2">({faculty.email})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") => 
                handleInputChange("status", value)
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Course"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseModal;