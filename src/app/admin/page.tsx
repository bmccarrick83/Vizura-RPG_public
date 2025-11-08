
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { KanbanBoard } from '@/components/admin/kanban-board';
import { ChangelogDialog, changelog } from '@/components/admin/changelog-dialog';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, limit, type Timestamp } from 'firebase/firestore';
import { type Task } from '@/types/task';
import { useMemo } from 'react';
import { subDays, format, parseISO, isAfter, startOfDay, isBefore } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const chartConfig = {
  todo: { label: 'To Do', color: 'hsl(var(--chart-1))' },
  inprogress: { label: 'In Progress', color: 'hsl(var(--chart-3))' },
  done: { label: 'Done', color: 'hsl(var(--chart-2))' },
};

export default function AdminPage() {
  const firestore = useFirestore();

  const tasksRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'tasks');
  }, [firestore]);

  const { data: tasks = [], isLoading: isTasksLoading, error: tasksError } = useCollection<Task & { createdAt?: Timestamp }>(tasksRef);

  const doneTasksQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'tasks'),
      where('status', '==', 'done'),
      orderBy('__name__', 'desc'),
      limit(5)
    );
  }, [firestore]);

  const { data: recentDoneTasks = [], isLoading: isRecentLoading, error: recentError } = useCollection<Task>(doneTasksQuery);

  const chartData = useMemo(() => {
    const firestoreTasks = (tasks ?? []).map(t => ({
      ...t,
      createdAt: t.createdAt?.toDate()
    }));

    const changelogTasks = changelog.flatMap(entry =>
      entry.tasks.map(taskTitle => ({
        id: `changelog-${entry.date}-${taskTitle}`,
        title: taskTitle,
        status: 'done' as const,
        createdAt: startOfDay(parseISO(entry.date))
      }))
    );
    
    const firestoreDoneTaskTitles = new Set(firestoreTasks.filter(t => t.status === 'done').map(t => t.title));
    const uniqueChangelogTasks = changelogTasks.filter(ct => !firestoreDoneTaskTitles.has(ct.title));

    return Array.from({ length: 7 }).map((_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));

      // Tasks from Firestore that exist on this date
      const activeTasksOnDate = firestoreTasks.filter(task => {
        if (!task.createdAt) return false;
        return !isAfter(task.createdAt, date);
      });

      // Historical tasks from changelog that were done on or before this date
      const doneChangelogTasksOnDate = uniqueChangelogTasks.filter(task => {
          return !isAfter(task.createdAt, date);
      });

      const inProgressCount = activeTasksOnDate.filter(t => t.status === 'inprogress').length;
      const doneFirestoreCount = activeTasksOnDate.filter(t => t.status === 'done').length;
      const doneCount = doneFirestoreCount + doneChangelogTasksOnDate.length;

      // "To Do" is the total number of active (Firestore) tasks that are not in other states.
      const todoCount = activeTasksOnDate.length - inProgressCount - doneFirestoreCount;

      return {
        date: format(date, 'yyyy-MM-dd'),
        done: doneCount,
        inprogress: inProgressCount,
        todo: todoCount,
      };
    });
  }, [tasks]);
  
  if (tasksError || recentError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching Admin Data</AlertTitle>
        <AlertDescription>
           There was a problem fetching tasks for the dashboard.
           <pre className="mt-2 text-xs bg-destructive/20 p-2 rounded-md overflow-x-auto">
             {tasksError?.message || recentError?.message}
           </pre>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="board">Project Board</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Cumulative Flow Diagram</CardTitle>
                <CardDescription>
                  Tracks the number of tasks in each stage over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {isTasksLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart
                      accessibilityLayer
                      data={chartData}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                      stackOffset="none" 
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="done"
                        type="natural"
                        fill={chartConfig.done.color}
                        fillOpacity={0.4}
                        stroke={chartConfig.done.color}
                        stackId="a"
                      />
                       <Area
                        dataKey="inprogress"
                        type="natural"
                        fill={chartConfig.inprogress.color}
                        fillOpacity={0.4}
                        stroke={chartConfig.inprogress.color}
                        stackId="a"
                      />
                      <Area
                        dataKey="todo"
                        type="natural"
                        fill={chartConfig.todo.color}
                        fillOpacity={0.4}
                        stroke={chartConfig.todo.color}
                        stackId="a"
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                    <CardDescription>The latest completed tasks.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-primary">Recently Completed</h4>
                            {isRecentLoading ? (
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                              </div>
                            ) : recentDoneTasks && recentDoneTasks.length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {recentDoneTasks.map(task => <li key={task.id} className="line-clamp-1">{task.title}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No tasks completed recently.</p>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardContent className="pt-4 mt-auto">
                     <ChangelogDialog>
                        <Button variant="outline" className="w-full">View Changelog</Button>
                    </ChangelogDialog>
                </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="board">
          <KanbanBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
