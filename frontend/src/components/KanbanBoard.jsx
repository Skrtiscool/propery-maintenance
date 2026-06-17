import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ALL_STATUSES = ['PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CLOSED'];
const WORKER_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CLOSED'];

function getPriorityColor(p) {
  switch (p) {
    case 'EMERGENCY': return 'bg-red-100 text-red-700';
    case 'HIGH': return 'bg-orange-100 text-orange-700';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-blue-100 text-blue-700';
  }
}

function getStatusColor(s) {
  switch (s) {
    case 'PENDING': return 'border-l-gray-400';
    case 'APPROVED': return 'border-l-blue-400';
    case 'ASSIGNED': return 'border-l-indigo-400';
    case 'IN_PROGRESS': return 'border-l-yellow-400';
    case 'WAITING_PARTS': return 'border-l-orange-400';
    case 'COMPLETED': return 'border-l-green-400';
    case 'CLOSED': return 'border-l-gray-600';
    default: return 'border-l-gray-400';
  }
}

export default function KanbanBoard({ tasks, onMoveTask, onCardClick, userRole }) {
  const STATUSES = userRole === 'WORKER' ? WORKER_STATUSES : ALL_STATUSES;
  const columns = STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    onMoveTask(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-4 bg-gray-100 min-h-screen">
        {STATUSES.map((status) => (
          <div key={status} className="flex-shrink-0 w-72 bg-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              {status.replace(/_/g, ' ')}
              <span className="ml-2 text-xs font-normal text-gray-500">
                ({columns[status]?.length || 0})
              </span>
            </h3>
            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 min-h-[200px]"
                >
                  {(columns[status] || []).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onCardClick?.(task)}
                            className={`bg-white p-4 rounded shadow-sm hover:shadow-md cursor-pointer transition-shadow border-l-4 ${getStatusColor(task.status)}`}
                          >
                            <div className="flex justify-between items-start">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <h4 className="mt-2 font-semibold text-sm">{task.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.property_name} - Unit {task.unit_number}
                          </p>
                          {task.assigned_to_name && (
                            <p className="text-xs text-gray-400 mt-1">
                              Assigned to: {task.assigned_to_name}
                            </p>
                          )}
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400">
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
