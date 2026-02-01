import { useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RootState, AppDispatch } from "@/store";
import { saveProfile, resetDraft } from "@/store/profileSlice";
import { format } from "date-fns";

export default function Step3() {
  const dispatch = useDispatch<AppDispatch>();
  const { draft, editingProfileId, loading } = useSelector((s: RootState) => s.profile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !draft.fullName ||
      !draft.email ||
      !draft.age ||
      !draft.city ||
      !draft.state ||
      !draft.country
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await dispatch(saveProfile({
        id: editingProfileId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        fullName: draft.fullName,
        email: draft.email,
        age: draft.age,
        city: draft.city,
        state: draft.state,
        country: draft.country,
        avatar: draft.avatar || "",
        createdAt: editingProfileId ? new Date(draft.createdAt!) : new Date(),
        updatedAt: new Date(),
      })).unwrap();
      
      dispatch(resetDraft());
      router.replace("/profiles");
    } catch (error) {
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Review & Submit",
          headerRight: () => <ThemeToggle />,
        }}
      />

      <View className="flex-1 bg-background px-6 pt-6">
        <View>
          <Text className="text-2xl font-semibold mb-2">
            Review Your Profile
          </Text>
          <Text className="text-muted-foreground mb-6">
            Step 3 of 3 - Check all details before submitting
          </Text>
        </View>

        {/* Summary Card */}
        <View className="rounded-xl border border-border bg-card p-4 gap-4">
          {/* Avatar Preview */}
          {draft.avatar && (
            <View className="items-center mb-2">
              <Image
                source={{ uri: draft.avatar }}
                className="w-24 h-24 rounded-full border-2 border-border"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Personal Info */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-muted-foreground">
              Personal Information
            </Text>
            <SummaryRow label="Full Name" value={draft.fullName} />
            <SummaryRow label="Email" value={draft.email} />
            <SummaryRow label="Age" value={draft.age} />
          </View>

          {/* Address Info */}
          <View className="gap-3 border-t border-border pt-3">
            <Text className="text-lg font-semibold text-muted-foreground">
              Address Information
            </Text>
            <SummaryRow label="City" value={draft.city} />
            <SummaryRow label="State" value={draft.state} />
            <SummaryRow label="Country" value={draft.country} />
          </View>
        </View>

        {/* Actions */}
        <View className="mt-auto pb-6 gap-3">
          <Button
            size="lg"
            onPress={handleSubmit}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <ActivityIndicator color="white" />
            ) : editingProfileId ? (
              "Update Profile"
            ) : (
              "Submit Profile"
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onPress={() => router.back()}
            disabled={isSubmitting || loading}
          >
            Edit Information
          </Button>
        </View>
      </View>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-muted-foreground">{label}</Text>
      <Text className="font-medium text-foreground text-right">
        {value || "Not provided"}
      </Text>
    </View>
  );
}