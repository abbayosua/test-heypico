// History API Route - Get and Clear Conversation History

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const conversations = await db.conversation.findMany({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messages: c.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          placesData: m.placesData ? JSON.parse(m.placesData) : null,
          createdAt: m.createdAt,
        })),
      })),
    });
  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clear conversation history
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const conversationId = searchParams.get('conversationId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    if (conversationId) {
      // Delete specific conversation
      await db.conversation.delete({
        where: { id: conversationId },
      });
    } else {
      // Delete all conversations for this session
      await db.conversation.deleteMany({
        where: { sessionId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
