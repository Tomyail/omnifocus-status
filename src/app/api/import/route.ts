import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db'; // Import the db client
import { tasks as tasksSchema } from '@/db/schema'; // Import the tasks schema
import { eq, sql } from 'drizzle-orm'; // Import sql helper
import * as z from 'zod'; // Import zod

// Define the expected structure of a single task using Zod
const TaskSchema = z.object({
    primaryKey: z.string(),
    name: z.string(),
    status: z.string().optional(),
    taskStatus: z.string().optional(), 
    active: z.boolean().optional(),
    added: z.string().datetime().optional(), 
    modified: z.string().datetime().optional(),
    completed: z.string().datetime().optional(),
    completionDate: z.string().datetime().optional(), 
    dueDate: z.string().datetime().optional(),
    note: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

// Infer the TypeScript type from the Zod schema
type Task = z.infer<typeof TaskSchema>;

// Define the expected structure of the request body
const RequestBodySchema = z.object({
    tasks: z.array(TaskSchema),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Received request body:', JSON.stringify(body, null, 2));

        const validationResult = RequestBodySchema.safeParse(body);
        if (!validationResult.success) {
            console.error('Invalid request body:', validationResult.error.errors);
            return NextResponse.json({ error: 'Invalid request body', details: validationResult.error.errors }, { status: 400 });
        }

        const { tasks } = validationResult.data;
        console.log(`Received ${tasks.length} tasks.`);

        if (tasks.length === 0) {
            return NextResponse.json({ message: 'No tasks received, nothing to import.' }, { status: 200 });
        }

        // Prepare data for batch insertion/update
        const tasksToUpsert = tasks.map((task: Task) => ({
            primaryKey: task.primaryKey,
            name: task.name,
            status: task.status,
            taskStatus: task.taskStatus,
            active: task.active,
            added: task.added ? new Date(task.added) : null,
            modified: task.modified ? new Date(task.modified) : null,
            completed: task.completed ? new Date(task.completed) : (task.completionDate ? new Date(task.completionDate) : null),
            completionDate: task.completionDate ? new Date(task.completionDate) : null,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            note: task.note,
            tags: task.tags,
            rawData: task, 
        }));

        console.log(`Preparing to upsert ${tasksToUpsert.length} tasks...`);

        const results = await db.insert(tasksSchema)
            .values(tasksToUpsert)
            .onConflictDoUpdate({
                target: tasksSchema.primaryKey, 
                set: { 
                    name: sql`excluded.name`,
                    status: sql`excluded.status`,
                    taskStatus: sql`excluded.task_status`,
                    active: sql`excluded.active`,
                    added: sql`excluded.added`,
                    modified: sql`excluded.modified`,
                    completed: sql`excluded.completed`,
                    completionDate: sql`excluded.completion_date`,
                    dueDate: sql`excluded.due_date`,
                    note: sql`excluded.note`,
                    tags: sql`excluded.tags`,
                    rawData: sql`excluded.raw_data`,
                    importedAt: new Date(), 
                },
            })
            .returning(); 

        console.log(`Successfully upserted ${results.length} tasks.`);

        return NextResponse.json({ message: `Successfully imported ${results.length} tasks into the database.` }, { status: 200 });

    } catch (error: any) {
        console.error('Error processing request:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data format', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
