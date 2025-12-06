<!--
Sync Impact Report
Version change: 0.0.0 → 1.0.0
Modified principles: None (all new)
Added sections: Core Principles (4), Development Standards, Compliance & Review
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (Constitution Check updated)
  ✅ .specify/templates/spec-template.md (no changes needed)
  ✅ .specify/templates/tasks-template.md (no changes needed)
Follow-up TODOs: None
-->
# Speckit Constitution

## Core Principles

### Code Quality (Non-negotiable)
All code MUST be readable, maintainable, and adhere to consistent style guidelines. Automated linting and formatting tools MUST be used and enforced in CI. Complexity MUST be justified; simple solutions are preferred. Code reviews MUST enforce quality standards before merging.

### Testing Standards (Non-negotiable)
Test-Driven Development (TDD) mandatory: Write failing tests first, get approval, then implement. All features MUST have unit, integration, and contract tests as appropriate. Test coverage for critical paths MUST exceed 90%. Tests MUST be independent, fast, and reliable.

### User Experience Consistency
User interfaces MUST follow consistent patterns and conventions across the system. Error messages MUST be clear, actionable, and user-friendly. User journeys MUST be intuitive and predictable. Accessibility standards (WCAG) MUST be met.

### Performance Requirements
Performance goals MUST be defined, measured, and monitored. Systems MUST meet latency, throughput, and resource usage targets. Performance regression tests MUST be included in CI. Scalability considerations MUST be addressed in design.

## Development Standards

- Follow language‑specific style guides and best practices.
- Write self‑documenting code; add comments only for non‑obvious logic.
- Commit messages must follow conventional commits format.
- Use feature branches and pull requests for all changes.
- Keep dependencies up‑to‑date and secure.

## Compliance & Review

- All changes must pass constitution compliance check before merging.
- Violations must be justified in complexity tracking table.
- Regular code reviews with at least one approver required.
- Performance and security reviews required for major changes.

## Governance

Amendments require a proposal documented in a PR, reviewed by maintainers, and must pass a constitution check. Versioning follows semantic versioning: MAJOR for principle removals or incompatible changes, MINOR for new principles or expansions, PATCH for clarifications. All PRs must include a constitution compliance check; violations must be justified. The constitution supersedes all other practices; any deviation requires explicit approval.

**Version**: 1.0.0 | **Ratified**: 2025-12-07 | **Last Amended**: 2025-12-07