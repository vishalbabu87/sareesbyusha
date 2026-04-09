import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const user = await db.user.findUnique({
      where: {
        email: payload.email.trim().toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await verifyPassword(payload.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

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

    return NextResponse.json({ error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
