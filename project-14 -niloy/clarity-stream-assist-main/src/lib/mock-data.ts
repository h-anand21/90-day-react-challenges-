export type Recording = {
  id: string;
  title: string;
  date: string;
  duration: string;
  language: string;
  status: "processed" | "processing";
  speakers: string[];
  keywords: string[];
  transcript: { speaker: string; time: string; text: string; confidence: number }[];
  summary: string;
  bullets: string[];
  actions: string[];
  bookmarks: { time: string; label: string }[];
};

export const recordings: Recording[] = [
  {
    id: "r1",
    title: "Intro to Neural Networks — Lecture 3",
    date: "Nov 14, 2026",
    duration: "48:12",
    language: "English",
    status: "processed",
    speakers: ["Prof. Anaya", "Student"],
    keywords: ["backpropagation", "gradient descent", "activation", "loss function"],
    transcript: [
      { speaker: "Prof. Anaya", time: "00:04", text: "Today we're building on last week's forward pass and moving into backpropagation.", confidence: 0.98 },
      { speaker: "Prof. Anaya", time: "00:22", text: "The key idea is that we can compute gradients efficiently using the chain rule.", confidence: 0.97 },
      { speaker: "Student", time: "01:10", text: "Does the choice of activation function affect how gradients flow?", confidence: 0.94 },
      { speaker: "Prof. Anaya", time: "01:18", text: "Great question — ReLU avoids the vanishing gradient problem that sigmoid struggles with.", confidence: 0.96 },
      { speaker: "Prof. Anaya", time: "02:03", text: "Let's walk through a concrete example with a two-layer network and mean squared error.", confidence: 0.98 },
    ],
    summary:
      "This lecture covered backpropagation, the chain-rule derivation for gradient flow, and practical considerations for choosing activation functions. Emphasis was placed on why ReLU is often preferred over sigmoid in deep networks.",
    bullets: [
      "Backpropagation applies the chain rule to compute gradients layer by layer.",
      "ReLU mitigates the vanishing gradient problem common with sigmoid.",
      "Loss functions like MSE and cross-entropy shape learning dynamics.",
      "Weight initialization matters — small values keep activations stable.",
    ],
    actions: [
      "Complete problem set 3 by Friday.",
      "Read chapter 4 of the textbook before next lecture.",
      "Try implementing backprop from scratch in NumPy.",
    ],
    bookmarks: [
      { time: "01:18", label: "ReLU vs sigmoid" },
      { time: "12:40", label: "Chain rule example" },
      { time: "31:05", label: "Assignment mentioned" },
    ],
  },
  {
    id: "r2",
    title: "Design Team Weekly Sync",
    date: "Nov 12, 2026",
    duration: "32:44",
    language: "English",
    status: "processed",
    speakers: ["Priya", "Marco", "Jules"],
    keywords: ["roadmap", "onboarding", "components", "shipping"],
    transcript: [
      { speaker: "Priya", time: "00:03", text: "Let's start with the onboarding revamp — I've got the new flow ready to review.", confidence: 0.97 },
      { speaker: "Marco", time: "00:20", text: "The empty states feel much friendlier now, nice work.", confidence: 0.95 },
      { speaker: "Jules", time: "01:02", text: "We should align on the component tokens before handoff on Thursday.", confidence: 0.96 },
    ],
    summary:
      "The team reviewed the onboarding revamp, discussed component tokens, and agreed on handoff timing. Empty states received positive feedback.",
    bullets: [
      "Onboarding flow is ready for review.",
      "Component tokens need alignment before handoff.",
      "Empty states received positive feedback.",
    ],
    actions: ["Finalize tokens by Wednesday.", "Ship onboarding v2 next Monday."],
    bookmarks: [{ time: "01:02", label: "Token alignment" }],
  },
  {
    id: "r3",
    title: "Ethics in AI — Guest Seminar",
    date: "Nov 08, 2026",
    duration: "1:12:03",
    language: "English",
    status: "processed",
    speakers: ["Dr. Okafor"],
    keywords: ["bias", "fairness", "accountability", "policy"],
    transcript: [
      { speaker: "Dr. Okafor", time: "00:05", text: "Fairness in AI isn't a checkbox — it's an ongoing negotiation with the communities we serve.", confidence: 0.98 },
    ],
    summary: "A guest seminar exploring fairness, accountability, and policy considerations in modern AI systems.",
    bullets: ["Fairness is contextual, not universal.", "Accountability requires transparent decision paths."],
    actions: ["Write reflection essay by end of week."],
    bookmarks: [],
  },
];

export const languages = [
  "English", "Hindi", "Bengali", "Tamil", "Telugu", "Gujarati",
  "Punjabi", "Marathi", "Malayalam", "Urdu", "French", "Spanish", "German", "Japanese",
];
