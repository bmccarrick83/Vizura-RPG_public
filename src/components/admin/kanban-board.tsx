
'use client';

import { useState, useMemo, useEffect } from 'react';
import { type Task, type TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Plus, Pencil, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection, updateDoc, doc, Timestamp, addDoc } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { changelog } from './changelog-dialog';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '../ui/textarea';
import { parseISO } from 'date-fns';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const columnConfig: { id: TaskStatus; title: string, colorClass: string }[] = [
  { id: 'todo', title: 'To Do', colorClass: 'bg-blue-500/20 border-blue-500' },
  { id: 'inprogress', title: 'In Progress', colorClass: 'bg-yellow-500/20 border-yellow-500' },
  { id: 'done', title: 'Done', colorClass: 'bg-green-500/20 border-green-500' },
];

function KanbanCard({ task, onMove, onEdit }: { task: Task & { date?: Date }; onMove: (taskId: string, direction: 'left' | 'right') => void; onEdit: (task: Task) => void; }) {
  if (!task) return null;

  const currentColumnIndex = columnConfig.findIndex(c => c.id === task.status);
  const column = columnConfig[currentColumnIndex];
  
  return (
    <div className={cn("group/card rounded-lg p-3 text-sm border-l-4", column?.colorClass)}>
        <div className="flex justify-between items-start">
            <div className="flex-1 pr-2 space-y-1">
                <p className="font-medium text-foreground">{task.title ?? 'Untitled'}</p>
                {task.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground line-clamp-2 cursor-pointer">{task.description}</p>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="max-w-xs">
                        <p className="whitespace-pre-wrap">{task.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
            </div>
            <div className="flex items-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                 {task.id && !task.id.startsWith('changelog-') && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(task)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Task</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onMove(task.id, 'left')} disabled={currentColumnIndex <= 0}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onMove(task.id, 'right')} disabled={currentColumnIndex >= columnConfig.length - 1}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    </div>
  );
}

function AddTaskDialog({ status, onAddTask }: { status: TaskStatus, onAddTask: (title: string, status: TaskStatus) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');

    const handleAddTask = () => {
        if(title.trim()) {
            onAddTask(title, status);
            setTitle('');
            setIsOpen(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Task to &quot;{columnConfig.find(c=>c.id === status)?.title}&quot;</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddTask}>Add Task</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function EditTaskDialog({ task, isOpen, onClose, onSave }: { task: Task | null; isOpen: boolean; onClose: () => void; onSave: (updatedTask: Partial<Task>) => void; }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    onSave({ title, description });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Make changes to your task below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Title</Label>
            <Input id="edit-task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description</Label>
            <Textarea id="edit-task-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a more detailed description..." rows={5} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function KanbanColumn({ title, tasks, status, onMove, onAddTask, onEdit, isLoading }: { title: string; tasks: (Task & { date?: Date })[]; status: TaskStatus; onMove: (taskId: string, direction: 'left' | 'right') => void; onAddTask: (title: string, status: TaskStatus) => void; onEdit: (task: Task) => void; isLoading: boolean; }) {
  const column = columnConfig.find(c => c.id === status);
  return (
    <div className="flex flex-col w-full min-w-[300px] bg-muted/50 rounded-lg">
      <div className={cn("p-4 border-b-4 flex justify-between items-center", column?.colorClass.replace('bg-', 'border-'))}>
        <h3 className="text-xl text-foreground font-semibold">{title}</h3>
        <AddTaskDialog status={status} onAddTask={onAddTask} />
      </div>
      <div className="p-2 space-y-2 flex-1 overflow-y-auto">
        {isLoading ? (
            <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ) : tasks.length > 0 ? (
            tasks.filter(Boolean).map(task => (
                <KanbanCard key={task.id} task={task} onMove={onMove} onEdit={onEdit} />
            ))
        ) : (
            <p className="text-sm text-muted-foreground p-2 text-center">No tasks here.</p>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const firestore = useFirestore();

  const tasksRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'tasks');
  }, [firestore]);
  const { data: tasks, isLoading, error } = useCollection<Task & { createdAt?: Timestamp }>(tasksRef);


  const columns = useMemo(() => {
    const firestoreTasks = tasks || [];

    const changelogTasks: (Task & { date: Date })[] = changelog
        .flatMap(entry => entry.tasks.map((taskTitle, i) => ({
            id: `changelog-${entry.date}-${i}`,
            title: taskTitle,
            status: 'done' as TaskStatus,
            date: parseISO(entry.date)
        })));

    const allTasks = firestoreTasks.map(t => ({
        ...t,
        date: t.createdAt?.toDate() || new Date(0)
    }));
    
    const allDoneTasks = [
        ...allTasks.filter(task => task.status === 'done'),
        ...changelogTasks.filter(ct => !allTasks.some(dt => dt.title === ct.title))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return columnConfig.map(col => ({
      ...col,
      tasks: col.id === 'done' 
        ? allDoneTasks 
        : allTasks.filter(task => task.status === col.id)
    }));
  }, [tasks]);

  const handleMoveTask = (taskId: string, direction: 'left' | 'right') => {
    if (!firestore || !tasks) return;
    
    if (taskId.startsWith('changelog-')) {
        return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentColumnIndex = columnConfig.findIndex(c => c.id === task.status);
    let nextColumnIndex = currentColumnIndex + (direction === 'right' ? 1 : -1);
    nextColumnIndex = Math.max(0, Math.min(columnConfig.length - 1, nextColumnIndex));

    if (nextColumnIndex === currentColumnIndex) return;

    const newStatus = columnConfig[nextColumnIndex].id;
    const taskRef = doc(firestore, 'tasks', taskId);
    updateDoc(taskRef, { status: newStatus }).catch(err => {
      const permissionError = new FirestorePermissionError({
        path: taskRef?.path || `tasks/${taskId}`,
        operation: 'update',
        requestResourceData: { status: newStatus },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const handleAddTaskManually = (title: string, status: TaskStatus) => {
    if (!firestore) return;
    const tasksCollection = collection(firestore, 'tasks');
    const data = { title, status, createdAt: Timestamp.now() };
    addDoc(tasksCollection, data).catch(err => {
       const permissionError = new FirestorePermissionError({
        path: tasksCollection?.path || 'tasks',
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }

  const handleEditTask = (task: Task) => {
      setEditingTask(task);
  }

  const handleSaveTask = (updatedData: Partial<Task>) => {
    if (!editingTask || !firestore) return;

    const taskRef = doc(firestore, 'tasks', editingTask.id);
    updateDoc(taskRef, updatedData).catch(err => {
       const permissionError = new FirestorePermissionError({
        path: taskRef?.path || `tasks/${editingTask.id}`,
        operation: 'update',
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
    setEditingTask(null);
  };
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Tasks</AlertTitle>
        <AlertDescription>
          There was a problem fetching tasks for the board.
          <pre className="mt-2 text-xs bg-destructive/20 p-2 rounded-md overflow-x-auto">{error.message}</pre>
        </AlertDescription>
      </Alert>
    )
  }


  return (
    <>
    <EditTaskDialog
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onSave={handleSaveTask}
    />
    <div className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
            {columns.map(col => (
                <KanbanColumn key={col.id} title={col.title} tasks={col.tasks} status={col.id} onMove={handleMoveTask} onAddTask={handleAddTaskManually} onEdit={handleEditTask} isLoading={isLoading} />
            ))}
        </div>
    </div>
    </>
  );
}
