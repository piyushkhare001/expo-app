import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Profile, DraftProfile } from "../types/profile";
import { Platform } from "react-native";

interface ProfileState {
  profiles: Profile[];
  draft: DraftProfile;
  loading: boolean;
  editingProfileId: string | null;
}

const initialState: ProfileState = {
  profiles: [],
  draft: {},
  loading: false,
  editingProfileId: null,
};

const STORAGE_KEY = "PROFILES";

// Simulate network delay
const simulateNetwork = () => new Promise(resolve => setTimeout(resolve, 800));

export const loadProfiles = createAsyncThunk(
  "profiles/load",
  async () => {
    await simulateNetwork();
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
);

export const saveProfile = createAsyncThunk(
  "profiles/save",
  async (profile: Profile, { getState }) => {
    await simulateNetwork();
    const state = getState() as { profile: ProfileState };
    const { editingProfileId } = state.profile;
    
    let updated;
    if (editingProfileId) {
      // Update existing profile
      updated = state.profile.profiles.map(p =>
        p.id === editingProfileId
          ? { ...profile, id: editingProfileId, updatedAt: new Date() }
          : p
      );
    } else {
      // Add new profile
      const newProfile = {
        ...profile,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      updated = [...state.profile.profiles, newProfile];
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
);

export const deleteProfileAsync = createAsyncThunk(
  "profiles/delete",
  async (id: string, { getState }) => {
    await simulateNetwork();
    const state = getState() as { profile: ProfileState };
    const filtered = state.profile.profiles.filter(p => p.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return id;
  }
);

export const startEditing = createAsyncThunk(
  "profiles/startEditing",
  async (id: string, { getState }) => {
    const state = getState() as { profile: ProfileState };
    const profile = state.profile.profiles.find(p => p.id === id);
    return profile || null;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    updateDraft(state, action: PayloadAction<DraftProfile>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    resetDraft(state) {
      state.draft = {};
      state.editingProfileId = null;
    },
    setEditingProfileId(state, action: PayloadAction<string | null>) {
      state.editingProfileId = action.payload;
    },
    updateProfileAvatar(state, action: PayloadAction<{ id: string; avatar: string }>) {
      const profile = state.profiles.find(p => p.id === action.payload.id);
      if (profile) {
        profile.avatar = action.payload.avatar;
        profile.updatedAt = new Date();
      }
      if (state.editingProfileId === action.payload.id) {
        state.draft.avatar = action.payload.avatar;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProfiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
      })
      .addCase(loadProfiles.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
        state.draft = {};
        state.editingProfileId = null;
      })
      .addCase(saveProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteProfileAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = state.profiles.filter(p => p.id !== action.payload);
      })
      .addCase(startEditing.fulfilled, (state, action) => {
        if (action.payload) {
          state.draft = { ...action.payload };
          state.editingProfileId = action.payload.id;
        }
      });
  },
});

export const {
  updateDraft,
  resetDraft,
  setEditingProfileId,
  updateProfileAvatar,
} = profileSlice.actions;
export default profileSlice.reducer;