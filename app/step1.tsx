import { useState } from "react";
import { View, Alert } from "react-native";
import { Stack } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateDraft, resetDraft } from "@/store/profileSlice";
import { router } from "expo-router";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RootState } from "@/store";
import { ValidationErrors } from "@/types/profile";

export default function Step1() {
  const dispatch = useDispatch();
  const draft = useSelector((s: RootState) => s.profile.draft);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = () => {
    const newErrors: ValidationErrors = {};
    
    if (!draft.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!draft.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!draft.age) {
      newErrors.age = "Age is required";
    } else if (draft.age < 1 || draft.age > 120) {
      newErrors.age = "Age must be between 1 and 120";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      router.push("/step2");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Basic Information',
          headerRight: () => <ThemeToggle />,
        }}
      />

      <View className="flex-1 bg-background px-6 pt-6 gap-6">
        <View>
          <Text className="text-2xl font-semibold text-foreground">
            Personal Details
          </Text>
          <Text className="text-muted-foreground mt-1">
            Step 1 of 3 - Tell us about yourself
          </Text>
        </View>

        <View className="gap-4">
          <View>
            <Input
              placeholder="Full Name *"
              value={draft.fullName || ""}
              onChangeText={(v) => dispatch(updateDraft({ fullName: v }))}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <Text className="text-destructive text-sm mt-1">{errors.fullName}</Text>
            )}
          </View>

          <View>
            <Input
              placeholder="Email Address *"
              value={draft.email || ""}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(v) => dispatch(updateDraft({ email: v }))}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <Text className="text-destructive text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          <View>
            <Input
              placeholder="Age *"
              value={draft.age ? String(draft.age) : ""}
              keyboardType="numeric"
              onChangeText={(v) => {
                const age = v ? parseInt(v, 10) : undefined;
                dispatch(updateDraft({ age }));
              }}
              className={errors.age ? "border-destructive" : ""}
            />
            {errors.age && (
              <Text className="text-destructive text-sm mt-1">{errors.age}</Text>
            )}
          </View>
        </View>

        <View className="mt-auto pb-6">
          <Button size="lg" onPress={handleNext}>
            Continue
          </Button>
        </View>
      </View>
    </>
  );
}