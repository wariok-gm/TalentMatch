import reducer, {
  advanceApplication,
  applyToJob,
  jobsInitialState,
  toggleSaveJob,
} from '../jobsSlice';

const ARG = { jobId: 'job-1', note: 'Available all week' };

describe('jobsSlice — optimistic apply', () => {
  it('adds a pending application immediately on applyToJob.pending', () => {
    const state = reducer(jobsInitialState, applyToJob.pending('req-1', ARG));
    const app = state.applications['job-1'];
    expect(app).toBeDefined();
    expect(app.status).toBe('submitted');
    expect(app.pending).toBe(true);
    expect(app.note).toBe(ARG.note);
  });

  it('confirms the application on applyToJob.fulfilled', () => {
    const optimistic = reducer(jobsInitialState, applyToJob.pending('req-1', ARG));
    const serverApp = {
      jobId: 'job-1',
      note: ARG.note,
      status: 'submitted' as const,
      appliedAt: new Date().toISOString(),
    };
    const state = reducer(optimistic, applyToJob.fulfilled(serverApp, 'req-1', ARG));
    expect(state.applications['job-1'].pending).toBe(false);
  });

  it('rolls the optimistic application back on applyToJob.rejected', () => {
    const optimistic = reducer(jobsInitialState, applyToJob.pending('req-1', ARG));
    const state = reducer(optimistic, applyToJob.rejected(new Error('boom'), 'req-1', ARG));
    expect(state.applications['job-1']).toBeUndefined();
  });

  it('advances application status through the fake review pipeline', () => {
    let state = reducer(jobsInitialState, applyToJob.pending('req-1', ARG));
    state = reducer(state, advanceApplication({ jobId: 'job-1', status: 'in_review' }));
    expect(state.applications['job-1'].status).toBe('in_review');
    state = reducer(state, advanceApplication({ jobId: 'job-1', status: 'shortlisted' }));
    expect(state.applications['job-1'].status).toBe('shortlisted');
  });

  it('ignores advanceApplication for jobs never applied to', () => {
    const state = reducer(jobsInitialState, advanceApplication({ jobId: 'ghost', status: 'in_review' }));
    expect(state.applications['ghost']).toBeUndefined();
  });
});

describe('jobsSlice — saved jobs', () => {
  it('toggles a job into savedIds, newest first, and back out', () => {
    let state = reducer(jobsInitialState, toggleSaveJob('job-1'));
    state = reducer(state, toggleSaveJob('job-2'));
    expect(state.savedIds).toEqual(['job-2', 'job-1']);
    state = reducer(state, toggleSaveJob('job-1'));
    expect(state.savedIds).toEqual(['job-2']);
  });
});
