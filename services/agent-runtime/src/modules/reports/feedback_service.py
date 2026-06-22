"""User feedback closure service.

Feedback records user judgement only. BadCase and EvaluationRun are follow-up
quality entries; this service never writes Memory or mutates runtime config.
"""

from __future__ import annotations

from dataclasses import dataclass

from src.infrastructure.database.runtime_foundation import (
    BadCaseRecord,
    BadCaseRepository,
    EvaluationDatasetRecord,
    EvaluationRunRecord,
    EvaluationRunRepository,
    FeedbackEvaluationClosureRepository,
    FeedbackRecord,
    FeedbackRepository,
    ReportRepository,
)

NEGATIVE_FEEDBACK_TYPES = {
    "not_useful",
    "incorrect",
    "sql_error",
    "source_insufficient",
    "analysis_shallow",
    "suggestion_unusable",
    "manual_correction",
}


class FeedbackClosureStateError(RuntimeError):
    """Raised when feedback cannot attach to the requested run/report chain."""


@dataclass(frozen=True)
class FeedbackClosureInput:
    feedback: FeedbackRecord
    dataset: EvaluationDatasetRecord
    evaluation_run: EvaluationRunRecord
    bad_case: BadCaseRecord | None


@dataclass(frozen=True)
class FeedbackClosureResult:
    feedback: FeedbackRecord
    evaluation_run: EvaluationRunRecord
    bad_case: BadCaseRecord | None


class FeedbackClosureService:
    """Persist Feedback and the minimum post-run quality closure records."""

    def __init__(
        self,
        *,
        bad_case_repository: BadCaseRepository,
        closure_repository: FeedbackEvaluationClosureRepository,
        evaluation_run_repository: EvaluationRunRepository,
        feedback_repository: FeedbackRepository,
        report_repository: ReportRepository,
    ) -> None:
        self._bad_case_repository = bad_case_repository
        self._closure_repository = closure_repository
        self._evaluation_run_repository = evaluation_run_repository
        self._feedback_repository = feedback_repository
        self._report_repository = report_repository

    def create(self, closure_input: FeedbackClosureInput) -> FeedbackClosureResult:
        self._validate_report_link(closure_input.feedback)
        self._closure_repository.create(
            feedback=closure_input.feedback,
            dataset=closure_input.dataset,
            evaluation_run=closure_input.evaluation_run,
            bad_case=closure_input.bad_case,
        )
        return FeedbackClosureResult(
            feedback=closure_input.feedback,
            evaluation_run=closure_input.evaluation_run,
            bad_case=closure_input.bad_case,
        )

    def list_feedback(self, run_id: str) -> list[FeedbackRecord]:
        return self._feedback_repository.list_by_run_id(run_id)

    def list_bad_cases(self, run_id: str) -> list[BadCaseRecord]:
        return self._bad_case_repository.list_by_run_id(run_id)

    def list_evaluation_runs(self, run_id: str) -> list[EvaluationRunRecord]:
        return self._evaluation_run_repository.list_by_run_id(run_id)

    def _validate_report_link(self, feedback: FeedbackRecord) -> None:
        reports = self._report_repository.list_by_run_id(feedback["runId"])
        if not any(report["reportId"] == feedback["reportId"] for report in reports):
            raise FeedbackClosureStateError(
                "Feedback.reportId must belong to the same AnalysisRun result."
            )
