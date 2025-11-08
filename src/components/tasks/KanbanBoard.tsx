import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { TaskColumn } from "./TaskColumn";
import { TaskFormDialog } from "./TaskFormDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { tasksService } from "@/services/tasks.service";
import { toast } from "sonner";
import { TaskCard } from "./TaskCard";
import { TASK_STATUS } from "@/constants";

interface KanbanBoardProps {
  projectId: string;
}

const columns = [
  { id: TASK_STATUS.TODO, title: "A Fazer", color: "bg-slate-500" },
  { id: TASK_STATUS.IN_PROGRESS, title: "Em Progresso", color: "bg-blue-500" },
  { id: TASK_STATUS.REVIEW, title: "Em Revisão", color: "bg-yellow-500" },
  { id: TASK_STATUS.DONE, title: "Concluído", color: "bg-green-500" },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("todo");
  const [activeTask, setActiveTask] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      const { data, error } = await tasksService.getByProject(projectId, currentWorkspace.id);
      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar tarefas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Otimistic update
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      if (!currentWorkspace) return;
      
      const { error } = await tasksService.updateStatus(taskId, newStatus, currentWorkspace.id);
      if (error) throw error;
      
      // Recalculate project progress after status change
      const { projectsService } = await import("@/services/projects.service");
      await projectsService.calculateProjectProgress(projectId, currentWorkspace.id);
      
      toast.success("Status atualizado!");
    } catch (error: any) {
      toast.error("Erro ao atualizar status");
      // Revert on error
      setTasks(tasks);
    }
  };

  const handleAddTask = (status: string) => {
    setSelectedTask(null);
    setSelectedStatus(status);
    setFormOpen(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setFormOpen(true);
  };

  const handleDeleteTask = (task: any) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTask || !currentWorkspace) return;

    try {
      setDeleting(true);
      const { error } = await tasksService.delete(selectedTask.id, currentWorkspace.id);
      if (error) throw error;

      toast.success("Tarefa excluída com sucesso!");
      fetchTasks();
      setDeleteDialogOpen(false);
      setSelectedTask(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir tarefa");
    } finally {
      setDeleting(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id} className="h-64 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-4">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              status={column.id}
              title={column.title}
              color={column.color}
              tasks={getTasksByStatus(column.id)}
              onAddTask={() => handleAddTask(column.id)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={fetchTasks}
        projectId={projectId}
        taskId={selectedTask?.id}
        initialData={selectedTask}
        initialStatus={selectedStatus}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedTask(null);
        }}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Excluir Tarefa"
        description={`Tem certeza que deseja excluir a tarefa "${selectedTask?.title}"? Esta ação não pode ser desfeita.`}
      />
    </>
  );
}
