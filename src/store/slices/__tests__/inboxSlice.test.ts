import { Conversation } from '../../../types';
import reducer, {
  inboxInitialState,
  loadInbox,
  markConversationRead,
  sendMessage,
} from '../inboxSlice';

function seededState() {
  const conversation: Conversation = {
    id: 'conv-1',
    talentId: 'talent-1',
    lastMessageAt: '2026-07-01T10:00:00.000Z',
    unread: 2,
    messages: [
      {
        id: 'm1',
        conversationId: 'conv-1',
        text: 'Hello!',
        sentAt: '2026-07-01T10:00:00.000Z',
        fromMe: false,
        status: 'read',
      },
    ],
  };
  return reducer(inboxInitialState, loadInbox.fulfilled([conversation], 'req-0'));
}

const SEND_ARG = { conversationId: 'conv-1', text: 'Hi there', localId: 'local-abc' };

describe('inboxSlice — optimistic send', () => {
  it('appends a "sending" bubble immediately and bumps the conversation to top', () => {
    const state = reducer(seededState(), sendMessage.pending('req-1', SEND_ARG));
    const conversation = state.conversations['conv-1'];
    const last = conversation.messages[conversation.messages.length - 1];
    expect(last.id).toBe('local-abc');
    expect(last.status).toBe('sending');
    expect(last.fromMe).toBe(true);
    expect(state.order[0]).toBe('conv-1');
  });

  it('flips the optimistic bubble to "sent" when the server acks', () => {
    const pending = reducer(seededState(), sendMessage.pending('req-1', SEND_ARG));
    const ack = {
      id: 'local-abc',
      conversationId: 'conv-1',
      text: 'Hi there',
      sentAt: new Date().toISOString(),
      fromMe: true,
      status: 'sent' as const,
    };
    const state = reducer(pending, sendMessage.fulfilled(ack, 'req-1', SEND_ARG));
    const message = state.conversations['conv-1'].messages.find((m) => m.id === 'local-abc');
    expect(message?.status).toBe('sent');
  });

  it('clears unread on markConversationRead', () => {
    const state = reducer(seededState(), markConversationRead('conv-1'));
    expect(state.conversations['conv-1'].unread).toBe(0);
  });

  it('does not clobber existing conversations on a later loadInbox', () => {
    const withLocal = reducer(seededState(), sendMessage.pending('req-1', SEND_ARG));
    const stale: Conversation = {
      ...withLocal.conversations['conv-1'],
      messages: withLocal.conversations['conv-1'].messages.slice(0, 1),
    };
    const state = reducer(withLocal, loadInbox.fulfilled([stale], 'req-2'));
    expect(
      state.conversations['conv-1'].messages.some((m) => m.id === 'local-abc'),
    ).toBe(true);
  });
});
