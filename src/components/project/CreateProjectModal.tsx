import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '../common';
import { useProjectStore } from '../../stores';
import { CreateProjectRequest } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [assigneeInput, setAssigneeInput] = useState('');
  const { createProject, isLoading } = useProjectStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateProjectRequest>({
    defaultValues: {
      assignees: [],
    },
  });

  const assignees = watch('assignees') || [];

  const handleClose = () => {
    reset();
    setAssigneeInput('');
    onClose();
  };

  const addAssignee = () => {
    if (assigneeInput.trim() && !assignees.includes(assigneeInput.trim())) {
      setValue('assignees', [...assignees, assigneeInput.trim()]);
      setAssigneeInput('');
    }
  };

  const removeAssignee = (assignee: string) => {
    setValue('assignees', assignees.filter(a => a !== assignee));
  };

  const onSubmit = async (data: CreateProjectRequest) => {
    try {
      const project = await createProject(data);
      handleClose();
      onSuccess?.(project.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      size="lg"
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Project Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Enter project name"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter project description"
            />
          </div>

          <Input
            label="Product Name"
            {...register('productName')}
            error={errors.productName?.message}
            placeholder="Enter product name"
          />

          <Input
            label="Manufacturer"
            {...register('manufacturer')}
            error={errors.manufacturer?.message}
            placeholder="Enter manufacturer"
          />

          <Input
            label="Model Reference"
            {...register('modelReference')}
            error={errors.modelReference?.message}
            placeholder="Enter model reference"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Standard
            </label>
            <select
              {...register('testStandard')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select test standard</option>
              <option value="EN 18031-1">EN 18031-1</option>
              <option value="EN 18031-2">EN 18031-2</option>
            </select>
            {errors.testStandard && (
              <p className="text-sm text-red-600 mt-1">{errors.testStandard.message}</p>
            )}
          </div>

          <Input
            label="Test Laboratory"
            {...register('testLaboratory')}
            error={errors.testLaboratory?.message}
            placeholder="Enter test laboratory"
          />

          <Input
            label="Report Reference"
            {...register('reportReference')}
            error={errors.reportReference?.message}
            placeholder="Enter report reference"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignees
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={assigneeInput}
              onChange={(e) => setAssigneeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssignee())}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter assignee email"
            />
            <Button type="button" onClick={addAssignee} size="sm">
              Add
            </Button>
          </div>
          
          {assignees.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignees.map((assignee) => (
                <span
                  key={assignee}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {assignee}
                  <button
                    type="button"
                    onClick={() => removeAssignee(assignee)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};