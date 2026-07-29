import { createAsyncThunk, createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import { fakeApi } from '../../api/fakeApi';
import { Conversation, ListStatus, Message } from '../../types';

export interface InboxState {
  conversations: Record<string, Conversation>;
  order: string[];
  status: ListStatus;
  error?: string;
}

export const inboxInitialState: InboxState = {
  conversations: {},
  order: [],
  status: 'idle',
};

export const loadInbox = createAsyncThunk('inbox/load', () => fakeApi.fetchConversations());

/**
 * Optimistic send: the bubble appears instantly with status "sending"; the
 * fake server ack flips it to "sent".
 */
export const sendMessage = createAsyncThunk(
  'inbox/sendMessage',
  (arg: { conversationId: string; text: string; localId: string }) =>
    fakeApi.sendMessage(arg.conversationId, arg.text, arg.localId),
);

/** Fake the other side typing, then replying. Dispatch after sendMessage settles. */
export const receiveAutoReply = createAsyncThunk(
  'inbox/receiveAutoReply',
  async (arg: { conversationId: string }, { getState, dispatch }) => {
    dispatch(setTyping({ conversationId: arg.conversationId, typing: true }));
    const state = getState() as { inbox: InboxState };
    const count = state.inbox.conversations[arg.conversationId]?.messages.length ?? 0;
    try {
      return await fakeApi.fetchAutoReply(arg.conversationId, count);
    } finally {
      dispatch(setTyping({ conversationId: arg.conversationId, typing: false }));
    }
  },
);

export function makeLocalMessageId(): string {
  return `local-${nanoid()}`;
}

function touchOrder(state: InboxState, conversationId: string) {
  state.order = [conversationId, ...state.order.filter((id) => id !== conversationId)];
}

const inboxSlice = createSlice({
  name: 'inbox',
  initialState: inboxInitialState,
  reducers: {
    setTyping(state, action: PayloadAction<{ conversationId: string; typing: boolean }>) {
      const conversation = state.conversations[action.payload.conversationId];
      if (conversation) conversation.typing = action.payload.typing;
    },
    markConversationRead(state, action: PayloadAction<string>) {
      const conversation = state.conversations[action.payload];
      if (conversation) conversation.unread = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInbox.pending, (state) => {
        state.error = undefined;
        if (state.status !== 'ready') state.status = 'loading';
        else state.status = 'refreshing';
      })
      .addCase(loadInbox.fulfilled, (state, action) => {
        // Don't clobber conversations that already have local (optimistic) messages.
        for (const conversation of action.payload) {
          if (!state.conversations[conversation.id]) {
            state.conversations[conversation.id] = conversation;
          }
        }
        state.order = Object.values(state.conversations)
          .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
          .map((c) => c.id);
        state.status = 'ready';
      })
      .addCase(loadInbox.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong';
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { conversationId, text, localId } = action.meta.arg;
        const conversation = state.conversations[conversationId];
        if (!conversation) return;
        const optimistic: Message = {
          id: localId,
          conversationId,
          text,
          sentAt: new Date().toISOString(),
          fromMe: true,
          status: 'sending',
        };
        conversation.messages.push(optimistic);
        conversation.lastMessageAt = optimistic.sentAt;
        touchOrder(state, conversationId);
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const conversation = state.conversations[action.payload.conversationId];
        const message = conversation?.messages.find((m) => m.id === action.payload.id);
        if (message) message.status = 'sent';
      })
      .addCase(receiveAutoReply.fulfilled, (state, action) => {
        const conversation = state.conversations[action.payload.conversationId];
        if (!conversation) return;
        conversation.messages.push(action.payload);
        conversation.lastMessageAt = action.payload.sentAt;
        touchOrder(state, action.payload.conversationId);
      });
  },
});

export const { setTyping, markConversationRead } = inboxSlice.actions;
export default inboxSlice.reducer;
