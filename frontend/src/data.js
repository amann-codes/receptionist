// ─── Demo user (bypasses all backend calls) ───────────────────────────────────
export const DEMO_USER = {
  username:     'demo',
  password:     'demo123',
  name:         'Aman Verma',
  email:        'aman@example.com',
  phoneNumber:  '+1 (415) 555-0192',
  vapiNumberId: 'demo-number-id',
  plan:         'Starter',
}

export const DEMO_AGENT_CONFIG = {
  agentName:        'Maya',
  firstMessage:     "Hi, you've reached Aman's office. I'm Maya, his AI assistant. He's unavailable right now — how can I help you?",
  personality:      'professional',
  collectName:      true,
  collectReason:    true,
  collectCallback:  false,
  forwardingNumber: '',
  endMessage:       "Got it, I'll make sure Aman gets your message. Have a great day!",
}

export const DEMO_CALLS = [
  {
    call_id: 'demo-1',
    received_at: new Date(Date.now() - 12 * 60000).toISOString(),
    caller_name: 'Priya Sharma',
    intent: 'urgent',
    message: 'Need to reschedule the product review meeting ASAP — client pushed it to today at 3pm.',
    summary: 'Client-facing product review moved to today 3pm. Urgent calendar update needed.',
    status: 'unread',
    duration_seconds: 87,
    transcript: [
      { role: 'bot',  text: "Hi, you've reached Aman's office. I'm Maya, his AI assistant. He's unavailable right now — how can I help you?" },
      { role: 'user', text: 'This is Priya. I need to urgently speak about rescheduling the product review.' },
      { role: 'bot',  text: "Got it Priya, I'll make sure he gets your message right away." },
      { role: 'user', text: 'Please — the client called and moved it to today at 3pm.' },
      { role: 'bot',  text: "Understood. I'll flag this as urgent. Anything else I should pass along?" },
      { role: 'user', text: 'No, just please tell him ASAP.' },
    ],
  },
  {
    call_id: 'demo-2',
    received_at: new Date(Date.now() - 55 * 60000).toISOString(),
    caller_name: 'Arjun Mehta',
    intent: 'work',
    message: 'Calling about the Q2 budget proposal. Please review the updated spreadsheet before the board meeting.',
    summary: 'Follow-up on Q2 budget proposal. Requires review before board meeting.',
    status: 'unread',
    duration_seconds: 63,
    transcript: [
      { role: 'bot',  text: "Hi, who am I speaking with?" },
      { role: 'user', text: "It's Arjun. Calling to follow up on the Q2 budget proposal I sent over." },
      { role: 'bot',  text: "I'll pass your message along." },
      { role: 'user', text: 'Please let him know I also updated the spreadsheet.' },
    ],
  },
  {
    call_id: 'demo-3',
    received_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    caller_name: 'Riya Kapoor',
    intent: 'personal',
    message: 'Calling to confirm dinner plans for Saturday at 7pm at Toit.',
    summary: 'Personal call to confirm Saturday dinner at Toit, 7pm.',
    status: 'read',
    duration_seconds: 41,
    transcript: [
      { role: 'bot',  text: "Hi, who's calling?" },
      { role: 'user', text: "Hi, it's Riya. Just confirming dinner on Saturday at Toit, 7pm." },
      { role: 'bot',  text: "I'll let him know." },
    ],
  },
  {
    call_id: 'demo-4',
    received_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    caller_name: 'Vikram Singh',
    intent: 'work',
    message: 'The API integration is throwing 500 errors in production. We need a call today if possible.',
    summary: 'Production API issue — 500 errors. Needs urgent technical call.',
    status: 'actioned',
    duration_seconds: 112,
    transcript: [
      { role: 'bot',  text: "Who am I speaking with?" },
      { role: 'user', text: "Vikram from the tech team. We have a production issue — API throwing 500 errors." },
      { role: 'bot',  text: "That sounds critical, I'll make sure he gets this immediately." },
      { role: 'user', text: 'Yes please, we need a call as soon as possible.' },
    ],
  },
  {
    call_id: 'demo-5',
    received_at: new Date(Date.now() - 9 * 3600000).toISOString(),
    caller_name: 'Unknown',
    intent: 'spam',
    message: 'Calling about your vehicle extended warranty.',
    summary: 'Spam call about extended vehicle warranty.',
    status: 'read',
    duration_seconds: 18,
    transcript: [
      { role: 'bot',  text: "Who am I speaking with?" },
      { role: 'user', text: "This is regarding your vehicle's extended warranty expiring soon." },
    ],
  },
  {
    call_id: 'demo-6',
    received_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    caller_name: 'Neha Joshi',
    intent: 'work',
    message: "Wanted to discuss what we need to prepare for tomorrow's sprint planning. Also the Figma files need access.",
    summary: 'Sprint planning prep discussion + Figma access request.',
    status: 'actioned',
    duration_seconds: 95,
    transcript: [
      { role: 'bot',  text: "Hi, who's calling?" },
      { role: 'user', text: "Hi, it's Neha. Calling about tomorrow's sprint planning and I need Figma access." },
      { role: 'bot',  text: "I'll pass your message along right away." },
    ],
  },
  {
    call_id: 'demo-7',
    received_at: new Date(Date.now() - 30 * 3600000).toISOString(),
    caller_name: 'Aman Gupta',
    intent: 'work',
    message: "Wanted to discuss what needs to be worked on for tomorrow's meeting.",
    summary: "Aman called to discuss work-related topics for tomorrow's meeting.",
    status: 'read',
    duration_seconds: 54,
    transcript: [
      { role: 'bot',  text: "Hi, you've reached the assistant. He's unavailable right now. Who am I speaking with?" },
      { role: 'user', text: "This is Aman and I wanted to talk about tomorrow's meeting, what we need to work on." },
      { role: 'bot',  text: "Got it Aman, I'll make sure he gets your message." },
    ],
  },
]

export const INTENT_META = {
  urgent:   { label: 'Urgent',   color: 'text-brand-red',   bg: 'bg-brand-red-dim',   dot: 'bg-brand-red' },
  work:     { label: 'Work',     color: 'text-brand-blue',  bg: 'bg-brand-blue-dim',  dot: 'bg-brand-blue' },
  personal: { label: 'Personal', color: 'text-brand-green', bg: 'bg-brand-green-dim', dot: 'bg-brand-green' },
  spam:     { label: 'Spam',     color: 'text-tx-3',        bg: 'bg-surface-2',       dot: 'bg-tx-3' },
  other:    { label: 'Other',    color: 'text-tx-3',        bg: 'bg-surface-2',       dot: 'bg-tx-3' },
}

export const STATUS_META = {
  unread:   { label: 'Unread',   dot: 'bg-accent' },
  read:     { label: 'Read',     dot: 'bg-tx-3' },
  actioned: { label: 'Actioned', dot: 'bg-brand-green' },
}

export const PERSONALITY_OPTIONS = [
  { id: 'professional', label: 'Professional', desc: 'Formal, concise, business-like' },
  { id: 'friendly',     label: 'Friendly',      desc: 'Warm, conversational, approachable' },
  { id: 'formal',       label: 'Formal',        desc: 'Corporate, structured, precise' },
  { id: 'casual',       label: 'Casual',        desc: 'Relaxed, natural, easy-going' },
]
