/**
 * ConversationMemory
 *
 * Rolling short-term memory of past speaker→interpreter turns, per target
 * language. Fed to the interpreter model on every utterance so:
 *  - terminology stays CONSISTENT across turns
 *  - references ("she", "that idea", "the same one") RESOLVE naturally
 *  - REGISTER and TONE stay stable across the conversation
 *  - speaker CONTINUITY is preserved
 *
 * Deliberately capped (last N turns) to keep prompt size + latency bounded.
 */

export type InterpreterTurn = {
  source: string;
  interpretation: string;
  sourceLanguage?: string;
  targetLanguage: string;
  at: number;
};

class ConversationMemoryImpl {
  private turns: InterpreterTurn[] = [];
  private readonly max = 16;

  push(turn: InterpreterTurn): void {
    this.turns.push(turn);
    if (this.turns.length > this.max) this.turns = this.turns.slice(-this.max);
  }

  /** Recent turns for the given target language, oldest first. */
  recent(targetLanguage: string, n: number = 8): Array<{ source: string; interpretation: string }> {
    return this.turns
      .filter((t) => t.targetLanguage === targetLanguage)
      .slice(-n)
      .map((t) => ({ source: t.source, interpretation: t.interpretation }));
  }

  clear(): void { this.turns = []; }
}

export const ConversationMemory = new ConversationMemoryImpl();
