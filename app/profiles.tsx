import { useState } from "react";
import { FlatList, View, Image, Alert, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { useColorScheme } from "nativewind";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Card } from "@/components/ui/card";
import { RootState, AppDispatch } from "@/store";
import { deleteProfileAsync, startEditing, resetDraft, loadProfiles } from "@/store/profileSlice";
import { format } from "date-fns";
import { User, Edit, Trash2, Calendar, Plus, Mail, MapPin, UserCircle } from "lucide-react-native";

// Helper function to get icon color based on theme
const useIconColor = () => {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? "#d4d4d8" : "#52525b";
};

export default function Profiles() {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles, loading } = useSelector((s: RootState) => s.profile);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const iconColor = useIconColor();
  const { colorScheme } = useColorScheme();

  const handleEdit = async (id: string) => {
    await dispatch(startEditing(id));
    dispatch(resetDraft()); 
    router.push("/step1");
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to delete this profile?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(id);
            try {
              await dispatch(deleteProfileAsync(id)).unwrap();
            } catch (error) {
              Alert.alert("Error", "Failed to delete profile");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderProfileItem = ({ item }: { item: any }) => (
    <Card className="mb-4 overflow-hidden">
      <View className="p-5 gap-5">
        {/* Header with Avatar and Basic Info */}
        <View className="flex-row items-start gap-4">
          <View className="relative">
            {item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                className="w-20 h-20 rounded-full border-2 border-border"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-muted/30 items-center justify-center border-2 border-border">
                <UserCircle size={36} color={iconColor} />
              </View>
            )}
          </View>
          
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground mb-1">
              {item.fullName}
            </Text>
            
            <View className="flex-row items-center gap-2 mb-1">
              <Mail size={14} color={iconColor} />
              <Text className="text-muted-foreground flex-1">{item.email}</Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              <User size={14} color={iconColor} />
              <Text className="text-muted-foreground">Age: {item.age}</Text>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View className="bg-muted/30 rounded-lg p-3">
          <View className="flex-row items-center gap-2 mb-2">
            <MapPin size={16} color={iconColor} />
            <Text className="font-semibold text-foreground">Location</Text>
          </View>
          <Text className="text-foreground">
            {item.city}, {item.state}, {item.country}
          </Text>
        </View>

        {/* Timestamps */}
        <View className="flex-row justify-between items-center pt-2 border-t border-border">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={12} color={iconColor} />
            <Text className="text-xs text-muted-foreground">
              Created: {format(new Date(item.createdAt), "MMM d, yyyy")}
            </Text>
          </View>
          
          {item.updatedAt && item.updatedAt !== item.createdAt && (
            <Text className="text-xs text-muted-foreground">
              Updated: {format(new Date(item.updatedAt), "MMM d, yyyy")}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 pt-3">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => handleEdit(item.id)}
            disabled={loading && deletingId !== item.id}
          >
            <Edit size={18} color={iconColor} className="mr-2" />
            <Text className="font-medium">Edit</Text>
          </Button>
          
          <Button
            variant="destructive"
            className="flex-1"
            onPress={() => handleDelete(item.id)}
            disabled={loading || deletingId === item.id}
          >
            {deletingId === item.id ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" className="mr-2" />
                <Text className="font-medium">Deleting</Text>
              </View>
            ) : (
              <>
                <Trash2 size={18} color="white" className="mr-2" />
                <Text className="font-medium">Delete</Text>
              </>
            )}
          </Button>
        </View>
      </View>
    </Card>
  );

  // Show loading state only on initial load
  if (loading && profiles.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Profiles",
            headerRight: () => <ThemeToggle />,
          }}
        />
        <View className="flex-1 bg-background items-center justify-center">
          <ActivityIndicator size="large" color={colorScheme === "dark" ? "#d4d4d8" : "#52525b"} />
          <Text className="mt-4 text-muted-foreground">Loading profiles...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profiles",
          headerRight: () => <ThemeToggle />,
        }}
      />

      <View className="flex-1 bg-background">
   
        {/* Content */}
        <View className="flex-1 px-5 pt-5">
          {/* Create New Profile Button - FIXED */}
          <View className="mb-6">
            <Button
              size="lg"
              onPress={() => {
                dispatch(resetDraft());
                router.push("/step1");
              }}
              disabled={loading}
              className="flex-row items-center justify-center gap-3"
            >
              <Plus size={22} className="text-primary-foreground" />
<Text className="text-primary-foreground text-base font-semibold">
                Create New Profile
              </Text>
            </Button>
          </View>

          {loading && profiles.length > 0 && (
            <View className="py-4 items-center bg-card/50 rounded-lg mb-4">
              <ActivityIndicator size="small" color={iconColor} />
              <Text className="text-muted-foreground text-sm mt-2">
                Refreshing profiles...
              </Text>
            </View>
          )}

          {profiles.length === 0 && !loading ? (
            <View className="flex-1 items-center justify-center px-6">
              <View className="items-center gap-6">
                <View className="w-32 h-32 rounded-full bg-muted/30 items-center justify-center">
                  <UserCircle size={64} color={iconColor} />
                </View>
                <View className="items-center gap-2">
                  <Text className="text-2xl font-bold text-foreground">
                    No profiles yet
                  </Text>
                  <Text className="text-muted-foreground text-center text-base">
                    Get started by creating your first profile
                  </Text>
                </View>
                <Button
                  size="lg"
                  onPress={() => {
                    dispatch(resetDraft());
                    router.push("/step1");
                  }}
                  className="px-8"
                >
                  <Plus size={20} color="white" className="mr-2" />
                  Create First Profile
                </Button>
              </View>
            </View>
          ) : (
            <FlatList
              data={profiles}
              keyExtractor={(item) => item.id}
              renderItem={renderProfileItem}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              refreshing={loading && profiles.length > 0}
              onRefresh={() => dispatch(loadProfiles())}
              ListHeaderComponent={
                profiles.length > 0 ? (
                  <View className="mb-4">
                    <Text className="text-lg font-semibold text-foreground">
                      All Profiles ({profiles.length})
                    </Text>
                    <Text className="text-muted-foreground text-sm mt-1">
                      Pull down to refresh
                    </Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="py-10 items-center">
                  <Text className="text-muted-foreground">
                    No profiles found
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </>
  );
}