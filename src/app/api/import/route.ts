import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db'; // Import the db client
import { tasks as tasksSchema } from '@/db/schema'; // Import the tasks schema
import { eq, sql } from 'drizzle-orm'; // Import sql helper
import * as z from 'zod'; // Import zod
import { hashString } from '@/utils/hashUtils'; // Import the hash utility

// Helper function to get the expected API key from environment variables
function getApiKey(): string | undefined {
  return process.env.IMPORT_API_SECRET_KEY;
}

// Define the expected structure of a single task using Zod
const TaskSchema = z.object({
    primaryKey: z.string(),
    name: z.string(),
    status: z.string().optional(),
    // active: z.boolean().optional(),
    // taskStatus: z.string().optional(),
    // dueDate: z.string().datetime().optional(),
    // note: z.string().optional(),
    // tags: z.array(z.string()).optional(),
    // rawData: z.any().optional(), // Store the raw task data as-is
    added: z.string().datetime().optional(), 
    modified: z.string().datetime().optional(),
    completed: z.string().datetime().optional(),
    completionDate: z.string().datetime().optional(), 
});

// Infer the TypeScript type from the Zod schema
type Task = z.infer<typeof TaskSchema>;

// Define the expected structure of the request body
const RequestBodySchema = z.object({
    tasks: z.array(TaskSchema),
});

export async function POST(req: NextRequest) {
    const apiKey = getApiKey();

    // --- Authorization Check --- 
    if (!apiKey) {
        console.error('API Key is not configured in environment variables.');
        // Don't expose this error detail to the client
        return new NextResponse('Server configuration error.', { status: 500 }); 
    }

    const authHeader = req.headers.get('Authorization');
    const expectedAuthValue = `Bearer ${apiKey}`;

    if (!authHeader || authHeader !== expectedAuthValue) {
        console.warn('Unauthorized API access attempt.', authHeader, expectedAuthValue);
        // Return a more helpful JSON response
        return NextResponse.json(
            {
              error: 'Unauthorized',
              message: 'Missing or invalid Authorization header. Please include the header as \'Authorization: Bearer YOUR_API_SECRET_KEY\'.'
            },
            { status: 401 }
          );
    }
    // --- End Authorization Check ---

    console.log('Authorization successful. Processing import...');

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
        const tasksToUpsert = tasks.map((task: Task) => {
            const hashedName = hashString(task.name);
            return {
                primaryKey: task.primaryKey,
                // Use the hashed name, or the original if hashing failed/invalid input
                name: hashedName !== null ? hashedName : task.name,
                status: task.status,
                added: task.added ? new Date(task.added) : null,
                modified: task.modified ? new Date(task.modified) : null,
                completed: task.completed ? new Date(task.completed) : (task.completionDate ? new Date(task.completionDate) : null),
                completionDate: task.completionDate ? new Date(task.completionDate) : null,
                // Provide defaults for fields potentially missing from input due to Zod schema changes
                // Adjust defaults based on actual DB schema constraints (nullable/non-nullable)
                active: (task as any).active ?? null, 
                taskStatus: (task as any).taskStatus ?? null,
                dueDate: (task as any).dueDate ? new Date((task as any).dueDate) : null,
                note: (task as any).note ?? null,
                tags: (task as any).tags ?? null, // Assuming db column allows null
                rawData: (task as any).rawData ?? {}, // Assuming rawData is required (non-nullable) in DB
            };
        });

        console.log(`Preparing to upsert ${tasksToUpsert.length} tasks...`);

        const results = await db.insert(tasksSchema)
            .values(tasksToUpsert)
            .onConflictDoUpdate({
                target: tasksSchema.primaryKey, 
                set: { 
                    name: sql`excluded.name`,
                    status: sql`excluded.status`,
                    added: sql`excluded.added`,
                    modified: sql`excluded.modified`,
                    completed: sql`excluded.completed`,
                    completionDate: sql`excluded.completion_date`,
                    // Excluded fields are set to null on insert, don't update them on conflict
                    // active: sql`excluded.active`, 
                    // taskStatus: sql`excluded.task_status`,
                    // dueDate: sql`excluded.due_date`,
                    // note: sql`excluded.note`,
                    // tags: sql`excluded.tags`,
                    // rawData: sql`excluded.raw_data`, // rawData is set to null/{} on insert, don't update it
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

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
