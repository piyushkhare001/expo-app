import { useState } from "react";
import { View, Alert, Image, TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { updateDraft } from "@/store/profileSlice";
import { RootState } from "@/store";
import { ValidationErrors } from "@/types/profile";
import { Camera, User, Upload } from "lucide-react-native";
import { useColorScheme } from "nativewind";

// Create a utility function to convert image to base64 using modern API
const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    // Using fetch API instead of deprecated FileSystem.readAsStringAsync
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
};


export default function Step2() {
  const dispatch = useDispatch();
  const draft = useSelector((s: RootState) => s.profile.draft);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isPickingImage, setIsPickingImage] = useState(false);
  const { colorScheme } = useColorScheme();

  const iconColor = colorScheme === "dark" ? "#d4d4d8" : "#71717a"; // zinc-300 for dark, zinc-500 for light
  const validate = () => {
    const newErrors: ValidationErrors = {};
    
    if (!draft.city?.trim()) newErrors.city = "City is required";
    if (!draft.state?.trim()) newErrors.state = "State is required";
    if (!draft.country?.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processImage = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets[0].uri) {
      setIsPickingImage(true);
      try {
        const uri = result.assets[0].uri;
        const base64 = await convertImageToBase64(uri);
        const avatarUri = `data:image/jpeg;base64,${base64}`;
        dispatch(updateDraft({ avatar: avatarUri }));
        

      } catch (error) {
        console.error("Error processing image:", error);
        Alert.alert("Error", "Failed to process image. Please try again.");
      } finally {
        setIsPickingImage(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow access to your photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false, // For better performance
      });

      await processImage(result);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
      setIsPickingImage(false);
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow camera access");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      await processImage(result);
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
      setIsPickingImage(false);
    }
  };

  const handleNext = () => {
    if (validate()) {
      router.push("/step3");
    }
  };

  const removeAvatar = () => {
    dispatch(updateDraft({ avatar: undefined }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Address Information",
          headerRight: () => <ThemeToggle />,
        }}
      />

      <View className="flex-1 bg-background px-6 pt-6 gap-6">
        <View>
          <Text className="text-2xl font-semibold text-foreground">
            Location & Avatar
          </Text>
          <Text className="text-muted-foreground mt-1">
            Step 2 of 3 - Add your location and profile picture
          </Text>
        </View>

      
        {/* Avatar Section */}
        <View className="items-center gap-4">
          <TouchableOpacity
            onPress={pickImage}
            disabled={isPickingImage}
            className="w-32 h-32 rounded-full bg-muted border-2 border-border items-center justify-center overflow-hidden"
          >
            {draft.avatar ? (
              <View className="relative w-full h-full">
                <Image
                  source={{ uri: draft.avatar }}
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
                {isPickingImage && (
                  <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <Text className="text-white text-sm">Processing...</Text>
                  </View>
                )}
              </View>
            ) : isPickingImage ? (
              <View className="items-center justify-center">
                <Text className="text-muted-foreground">Loading...</Text>
              </View>
            ) : (
              <User size={48} color={iconColor} />
            )}
          </TouchableOpacity>
          
          <View className="flex-row flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onPress={pickImage}
              disabled={isPickingImage}
              className="min-w-[120px]"
            >
              <Upload size={16} color={iconColor} className="mr-2" />
              Choose Photo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onPress={takePhoto}
              disabled={isPickingImage}
              className="min-w-[120px]"
            >
              <Camera size={16} color={iconColor} className="mr-2" />
              Take Photo
            </Button>
            
            {draft.avatar && (
              <Button
                variant="ghost"
                size="sm"
                onPress={removeAvatar}
                disabled={isPickingImage}
              >
                Remove
              </Button>
            )}
          </View>
          
          
          <Text className="text-xs text-muted-foreground text-center">
            Optional: Add a profile picture (1:1 ratio recommended)
          </Text>
        </View>

        {/* Address Fields */}
        <View className="gap-4">
          <View>
            <Input
              placeholder="City *"
              value={draft.city || ""}
              onChangeText={(v) => dispatch(updateDraft({ city: v }))}
              className={errors.city ? "border-destructive" : ""}
              editable={!isPickingImage}
            />
            {errors.city && (
              <Text className="text-destructive text-sm mt-1">{errors.city}</Text>
            )}
          </View>

          <View>
            <Input
              placeholder="State *"
              value={draft.state || ""}
              onChangeText={(v) => dispatch(updateDraft({ state: v }))}
              className={errors.state ? "border-destructive" : ""}
              editable={!isPickingImage}
            />
            {errors.state && (
              <Text className="text-destructive text-sm mt-1">{errors.state}</Text>
            )}
          </View>

          <View>
            <Input
              placeholder="Country *"
              value={draft.country || ""}
              onChangeText={(v) => dispatch(updateDraft({ country: v }))}
              className={errors.country ? "border-destructive" : ""}
              editable={!isPickingImage}
            />
            {errors.country && (
              <Text className="text-destructive text-sm mt-1">{errors.country}</Text>
            )}
          </View>
        </View>

        {/* Bottom actions */}
        <View className="mt-auto pb-6 flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => router.back()}
            disabled={isPickingImage}
          >
            Back
          </Button>

          <Button
            className="flex-1"
            onPress={handleNext}
            disabled={isPickingImage}
          >
            Continue
          </Button>
        </View>
      </View>
    </>
  );
}