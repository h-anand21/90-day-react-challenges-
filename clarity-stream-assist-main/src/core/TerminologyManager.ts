/**
 * TerminologyManager — enterprise glossary layer on top of TranslationMemory.
 *
 * Ships with domain packs (tech, medical, legal, finance) plus an API for
 * loading custom enterprise dictionaries at runtime. Consumers can either
 * consult it directly or read the merged glossary via `getPromptGlossary`.
 */

import { TranslationMemory } from "./TranslationMemory";

export type TerminologyDomain = "tech" | "medical" | "legal" | "finance";

const DOMAIN_PACKS: Record<TerminologyDomain, string[]> = {
  tech: [
    "Machine Learning", "Artificial Intelligence", "Database", "Cloud Computing",
    "TensorFlow", "PyTorch", "Kubernetes", "Docker", "GraphQL", "REST",
    "Serverless", "Edge Computing", "OAuth", "JWT",
  ],
  medical: [
    "Electronic Health Record", "Diagnosis", "Prognosis", "Anaesthesia",
    "Cardiology", "Radiology", "Pathology", "Neurology", "Oncology",
    "MRI", "CT Scan", "ICU",
  ],
  legal: [
    "Plaintiff", "Defendant", "Jurisdiction", "Affidavit", "Subpoena",
    "Litigation", "Arbitration", "Indemnity", "Force Majeure", "GDPR",
  ],
  finance: [
    "Balance Sheet", "P&L", "EBITDA", "Cash Flow", "Equity", "Derivative",
    "Hedge Fund", "IPO", "Bond Yield", "Amortization",
  ],
};

class TerminologyManagerImpl {
  private enabled = new Set<TerminologyDomain>();
  private custom = new Set<string>();

  enableDomain(domain: TerminologyDomain): void {
    this.enabled.add(domain);
    for (const term of DOMAIN_PACKS[domain]) TranslationMemory.addUserTerm(term);
  }

  disableDomain(domain: TerminologyDomain): void { this.enabled.delete(domain); }

  /** Bulk-load an enterprise dictionary (product names, internal acronyms, etc.). */
  loadEnterpriseDictionary(terms: Iterable<string>): void {
    for (const t of terms) {
      const term = t.trim();
      if (!term) continue;
      this.custom.add(term);
      TranslationMemory.addUserTerm(term);
    }
  }

  clearCustom(): void { this.custom.clear(); }

  getEnabledDomains(): TerminologyDomain[] { return [...this.enabled]; }
  getCustomTerms(): string[] { return [...this.custom]; }
}

export const TerminologyManager = new TerminologyManagerImpl();
