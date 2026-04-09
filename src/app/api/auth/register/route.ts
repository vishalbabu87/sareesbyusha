import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, getHasUsers, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { seedDemoWorkspace } from '@/lib/server-data';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const hasUsers = await getHasUsers();
    if (hasUsers) {
      return NextResponse.json({ error: 'Registration is disabled after the first owner account is created.' }, { status: 403 });
    }

    const payload = schema.parse(await request.json());
    const user = await db.user.create({
      data: {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        passwordHash: await hashPassword(payload.password),
      },
    });

    await seedDemoWorkspace(user.id);
    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unable to create the owner account.' }, { status: 500 });
  }
}
