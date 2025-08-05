import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Badge } from '../common';
import { Assessment, UpdateAssessmentRequest } from '../../types';

interface EditAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  onSave: (id: string, data: UpdateAssessmentRequest) => Promise<void>;
}

export const EditAssessmentModal: React.FC<EditAssessmentModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<UpdateAssessmentRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assessment) {
      setFormData({
        result: assessment.result,
        justification: assessment.justification,
        comments: assessment.comments,
        testPerformedOn: assessment.testPerformedOn,
        testExecutedBy: assessment.testExecutedBy,
      });
    }
  }, [assessment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment || !formData.result || !formData.justification) return;

    setIsSubmitting(true);
    try {
      await onSave(assessment.id, formData as UpdateAssessmentRequest);
      onClose();
    } catch (error) {
      console.error('Failed to update assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  if (!assessment) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Assessment">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assessment Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Assessment Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Test Case:</span>
              <div className="font-medium">{assessment.testCaseId}</div>
            </div>
            <div>
              <span className="text-gray-500">Original Date:</span>
              <div className="font-medium">{new Date(assessment.assessedAt).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>
              <div className="font-medium">v{assessment.version}</div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <Badge size="sm" variant="default">{assessment.status}</Badge>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Result <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.result || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, result: e.target.value as 'pass' | 'fail' | 'na' }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select result...</option>
              <option value="pass">PASS</option>
              <option value="fail">FAIL</option>
              <option value="na">NOT APPLICABLE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.justification || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Provide justification for the assessment result..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments (Optional)
            </label>
            <textarea
              value={formData.comments || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Additional comments..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Test Performed On"
              value={formData.testPerformedOn || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, testPerformedOn: e.target.value }))}
              placeholder="Equipment/System name"
            />
            <Input
              label="Test Executed By"
              value={formData.testExecutedBy || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, testExecutedBy: e.target.value }))}
              placeholder="Evaluator name"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.result || !formData.justification || isSubmitting}
            loading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};