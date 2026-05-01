import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSession } from '@/lib/server/admin';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 });
  }

  const { id } = await params;
  const messages = await prisma.privateMessage.findMany({
    where: { reportId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      senderAdmin: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      message: message.message,
      status: message.status,
      sentAt: message.sentAt,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      repliedAt: message.repliedAt,
      createdAt: message.createdAt,
      sender: message.senderAdmin,
      channel: message.channel,
    })),
  });
}
