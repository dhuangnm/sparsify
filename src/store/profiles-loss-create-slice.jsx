import { createSlice, createAsyncThunk, AsyncThunk } from "@reduxjs/toolkit";

import {
  jobProgressValue,
  requestGetJobTerminal,
  requestCreateProfileLoss,
  requestGetProjectProfileLoss,
  requestDeleteProjectProfileLoss,
  JOB_COMPLETED,
  JOB_CANCELED,
  JOB_ERROR,
  requestCancelJob,
} from "../api";
import {
  STATUS_FAILED,
  STATUS_IDLE,
  STATUS_LOADING,
  STATUS_SUCCEEDED,
  createAsyncThunkWrapper,
} from "./utils";

const SLICE_ID = "createLossProfile";
const createLossProfileThunkType = `${SLICE_ID}/createLossProfileThunk`;
const createLossProfileProgressType = `${createLossProfileThunkType}/progress`;

const createLossProfileProgress = (stage, progress, profile) => ({
  type: createLossProfileProgressType,
  payload: {
    stage,
    progress,
    profile,
  },
});

export const createLossProfileThunk = createAsyncThunkWrapper(
  createLossProfileThunkType,
  async (
    {
      projectId,
      name,
      pruningEstimations = true,
      pruningEstimationType = "weight_magnitude",
      pruningStructure = "unstructured",
      quantizedEstimations = false,
    },
    thunkAPI
  ) => {
    const createBody = await requestCreateProfileLoss(
      projectId,
      name,
      pruningEstimations,
      pruningEstimationType,
      pruningStructure,
      quantizedEstimations
    );

    const createdProfile = createBody.profile;

    thunkAPI.dispatch(
      createLossProfileProgress("profileLossCreate", 0, createdProfile)
    );
    return await requestGetJobTerminal(
      createdProfile.job.job_id,
      (progress) => {
        thunkAPI.dispatch(
          createLossProfileProgress(
            "profileLossProgress",
            jobProgressValue(progress),
            createdProfile
          )
        );
      },
      () => false
    ).then(async () => {
      // get the completed profile
      const getBody = await requestGetProjectProfileLoss(
        projectId,
        createdProfile.profile_id
      );
      return getBody.profile;
    });
  }
);

const cancelAndDeleteLossProfileThunkType = `${SLICE_ID}/cancelAndDeleteLossProfileThunk`;

export const cancelAndDeleteLossProfileThunk = createAsyncThunk(
  cancelAndDeleteLossProfileThunkType,
  async ({ projectId, profileId }) => {
    const getBody = await requestGetProjectProfileLoss(projectId, profileId);
    const profile = getBody.profile;
    const jobStatus = profile.job.job_status;
    try {
      if (
        !(
          jobStatus === JOB_COMPLETED ||
          jobStatus === JOB_CANCELED ||
          jobStatus === JOB_ERROR
        )
      ) {
        await requestCancelJob(profile.job.job_id);
      }
    } catch (error) {}
    return requestDeleteProjectProfileLoss(projectId, profileId);
  }
);

const createLossProfileSlice = createSlice({
  name: SLICE_ID,
  initialState: {
    val: null,
    status: STATUS_IDLE,
    error: null,
    progressStage: null,
    progressValue: null,
    profileId: null,
    cancellingStatus: STATUS_IDLE,
  },
  reducers: {
    clearCreateLossProfile: (state, action) => {
      state.error = null;
      state.val = null;
      state.progressStage = null;
      state.progressValue = null;
      state.status = STATUS_IDLE;
      state.profileId = null;
      state.cancellingStatus = STATUS_IDLE;
    },
  },
  extraReducers: {
    [cancelAndDeleteLossProfileThunk.fulfilled]: (state, action) => {
      state.error = null;
      state.val = null;
      state.progressStage = null;
      state.progressValue = null;
      state.profileId = null;
      state.cancellingStatus = STATUS_SUCCEEDED;
    },
    [cancelAndDeleteLossProfileThunk.pending]: (state, action) => {
      state.cancellingStatus = STATUS_LOADING;
    },
    [cancelAndDeleteLossProfileThunk.rejected]: (state, action) => {
      state.status = STATUS_FAILED;
      state.error = action.error.message;
      state.val = null;
      state.progressStage = null;
      state.progressValue = null;
      state.profileId = null;
      state.cancellingStatus = STATUS_FAILED;
    },
    [createLossProfileThunk.pending]: (state, action) => {
      state.status = STATUS_LOADING;
      state.error = null;
      state.val = null;
      state.progressStage = null;
      state.progressValue = null;
      state.profileId = null;
    },
    [createLossProfileThunk.fulfilled]: (state, action) => {
      state.status = STATUS_SUCCEEDED;
      if (state.cancellingStatus === STATUS_IDLE) {
        state.error = null;
        state.val = action.payload;
        state.progressStage = null;
        state.progressValue = null;
        state.profileId = action.payload.profile_id;
      }
    },
    [createLossProfileThunk.rejected]: (state, action) => {
      state.status = STATUS_FAILED;
      if (state.cancellingStatus === STATUS_IDLE) {
        state.error = action.error.message;
        state.val = null;
        state.progressStage = null;
        state.progressValue = null;
        state.profileId = null;
      }
    },
    [createLossProfileProgressType]: (state, action) => {
      state.status = STATUS_LOADING;
      if (state.cancellingStatus === STATUS_IDLE) {
        state.error = null;
        state.val = action.payload.profile;
        state.progressStage = action.payload.stage;
        state.progressValue = action.payload.progress;
        state.profileId = action.payload.profile.profile_id;
      }
    },
  },
});

/**
 * Available actions for createLossProfileSlice redux store
 */
export const { clearCreateLossProfile } = createLossProfileSlice.actions;

/**
 * Simple selector to get loss profile being created state
 * including the val, status, error, progressStage, and progressVal
 *
 * @param state - the redux store state
 * @returns {Reducer<State> | Reducer<{val: *[], error: null,progressStage: null, progressVal: null, status: string}>}
 */
export const selectCreateLossProfile = (state) => state.createLossProfile;

export default createLossProfileSlice.reducer;
