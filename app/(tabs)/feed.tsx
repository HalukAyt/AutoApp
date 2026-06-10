import { Ionicons } from "@expo/vector-icons";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getFeedPosts } from "@/services/postService";
import { createStory, deleteStory, getStories } from "@/services/storyService";
import type { FeedPost, Story } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const defaultAvatar = require("../../assets/images/3.jpg");

type IconName = ComponentProps<typeof Ionicons>["name"];
type StoryTool = "text" | "music" | "location" | "time";

type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
};

const STORY_DURATION_MS = 6500;

const STORY_TOOLS: { key: StoryTool; label: string; icon: IconName }[] = [
  { key: "text", label: "Yaz\u0131", icon: "text" },
  { key: "music", label: "M\u00fczik", icon: "musical-notes" },
  { key: "location", label: "Mekan", icon: "location" },
  { key: "time", label: "Saat", icon: "time" },
];
const MUSIC_CATALOG: MusicTrack[] = [
  {
    id: "night-drive",
    title: "Night Drive",
    artist: "SoundHelix",
    duration: "3:12",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "midnight-cruise",
    title: "Midnight Cruise",
    artist: "SoundHelix",
    duration: "2:58",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "garage-lights",
    title: "Garage Lights",
    artist: "SoundHelix",
    duration: "3:04",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "coastal-run",
    title: "Coastal Run",
    artist: "SoundHelix",
    duration: "3:20",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "turbo-mood",
    title: "Turbo Mood",
    artist: "SoundHelix",
    duration: "2:46",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: "late-stop",
    title: "Late Stop",
    artist: "SoundHelix",
    duration: "3:08",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    id: "city-loop",
    title: "City Loop",
    artist: "SoundHelix",
    duration: "2:54",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  {
    id: "highway-pulse",
    title: "Highway Pulse",
    artist: "SoundHelix",
    duration: "3:18",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
  {
    id: "sunset-ride",
    title: "Sunset Ride",
    artist: "SoundHelix",
    duration: "3:01",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  },
  {
    id: "tunnel-echo",
    title: "Tunnel Echo",
    artist: "SoundHelix",
    duration: "2:49",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  },
  {
    id: "cold-start",
    title: "Cold Start",
    artist: "SoundHelix",
    duration: "3:22",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  },
  {
    id: "fuel-stop",
    title: "Fuel Stop",
    artist: "SoundHelix",
    duration: "3:10",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
  },
  {
    id: "open-road",
    title: "Open Road",
    artist: "SoundHelix",
    duration: "3:05",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  },
  {
    id: "dashboard-glow",
    title: "Dashboard Glow",
    artist: "SoundHelix",
    duration: "2:57",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
  },
  {
    id: "bridge-run",
    title: "Bridge Run",
    artist: "SoundHelix",
    duration: "3:14",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
  },
  {
    id: "last-lap",
    title: "Last Lap",
    artist: "SoundHelix",
    duration: "3:00",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
  },
  {
    id: "garage-session",
    title: "Garage Session",
    artist: "SoundHelix",
    duration: "3:16",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
  },
  {
    id: "urban-signal",
    title: "Urban Signal",
    artist: "SoundHelix",
    duration: "2:52",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3",
  },
  {
    id: "engine-heart",
    title: "Engine Heart",
    artist: "SoundHelix",
    duration: "3:07",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3",
  },
  {
    id: "after-hours",
    title: "After Hours",
    artist: "SoundHelix",
    duration: "3:11",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3",
  },
];

const LOCATION_SUGGESTIONS = [
  "Bulundu\u011fum konum",
  "Kad\u0131k\u00f6y Sahil",
  "Moda",
  "Ba\u011fdat Caddesi",
  "Taksim",
  "Be\u015fikta\u015f",
  "Ortak\u00f6y",
  "\u0130stanbul Park",
  "Sahil Yolu",
  "Otopark",
];

const getStoryName = (story: Story) => {
  if (story.createdByMe) return "Sen";
  return story.authorName || story.authorUsername || "S\u00fcr\u00fcc\u00fc";
};

const formatStoryTime = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return "";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));
  if (diffMinutes < 1) return "\u015eimdi";
  if (diffMinutes < 60) return `${diffMinutes} dk`;

  return `${Math.floor(diffMinutes / 60)} sa`;
};

const formatStoryClock = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAddress = (address: Location.LocationGeocodedAddress) => {
  const firstLine = address.name || address.street || address.district;
  const secondLine = address.city || address.region;
  const parts = [firstLine, secondLine].filter(Boolean) as string[];
  const uniqueParts = parts.filter(
    (part, index) => parts.findIndex((item) => item === part) === index,
  );

  return uniqueParts.join(", ");
};

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [pendingStoryImageUri, setPendingStoryImageUri] = useState<string | null>(null);
  const [activeStoryTool, setActiveStoryTool] = useState<StoryTool>("text");
  const [storyCaption, setStoryCaption] = useState("");
  const [storyMusicTitle, setStoryMusicTitle] = useState("");
  const [storyMusicArtist, setStoryMusicArtist] = useState("");
  const [storyMusicUrl, setStoryMusicUrl] = useState("");
  const [musicSearch, setMusicSearch] = useState("");
  const [previewingMusicId, setPreviewingMusicId] = useState<string | null>(null);
  const [storyLocationName, setStoryLocationName] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [showStoryTimestamp, setShowStoryTimestamp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [deletingStory, setDeletingStory] = useState(false);
  const [locatingStory, setLocatingStory] = useState(false);

  const previewSoundRef = useRef<Audio.Sound | null>(null);
  const viewerSoundRef = useRef<Audio.Sound | null>(null);

  const selectedStory =
    selectedStoryIndex === null ? null : stories[selectedStoryIndex] ?? null;

  const selectedMusicLabel = storyMusicArtist
    ? `${storyMusicTitle} - ${storyMusicArtist}`
    : storyMusicTitle;

  const filteredMusicTracks = useMemo(() => {
    const query = musicSearch.trim().toLocaleLowerCase("tr-TR");
    if (!query) return MUSIC_CATALOG;

    return MUSIC_CATALOG.filter((track) =>
      `${track.title} ${track.artist}`.toLocaleLowerCase("tr-TR").includes(query),
    );
  }, [musicSearch]);

  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLocaleLowerCase("tr-TR");
    if (!query) return LOCATION_SUGGESTIONS;

    return LOCATION_SUGGESTIONS.filter((locationName) =>
      locationName.toLocaleLowerCase("tr-TR").includes(query),
    );
  }, [locationSearch]);

  const fetchFeed = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const [feedPosts, feedStories] = await Promise.all([
        getFeedPosts(),
        getStories(),
      ]);
      setPosts(feedPosts);
      setStories(feedStories);
    } catch (error) {
      console.error("Feed fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopPreviewMusic = useCallback(async () => {
    const sound = previewSoundRef.current;
    previewSoundRef.current = null;
    setPreviewingMusicId(null);

    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.log("Preview sound unload error:", error);
      }
    }
  }, []);

  const stopViewerMusic = useCallback(async () => {
    const sound = viewerSoundRef.current;
    viewerSoundRef.current = null;

    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.log("Viewer sound unload error:", error);
      }
    }
  }, []);

  const closeStoryViewer = useCallback(() => {
    setSelectedStoryIndex(null);
    void stopViewerMusic();
  }, [stopViewerMusic]);

  const handleNextStory = useCallback(() => {
    setSelectedStoryIndex((currentIndex) => {
      if (currentIndex === null) return null;
      const nextIndex = currentIndex + 1;
      return nextIndex < stories.length ? nextIndex : null;
    });
  }, [stories.length]);

  const handlePreviousStory = useCallback(() => {
    setSelectedStoryIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return currentIndex > 0 ? currentIndex - 1 : 0;
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeed(true);
    }, [fetchFeed]),
  );

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch((error) => console.log("Audio mode error:", error));

    return () => {
      void stopPreviewMusic();
      void stopViewerMusic();
    };
  }, [stopPreviewMusic, stopViewerMusic]);

  useEffect(() => {
    if (selectedStoryIndex === null || stories.length === 0) return;

    const timer = setTimeout(handleNextStory, STORY_DURATION_MS);
    return () => clearTimeout(timer);
  }, [handleNextStory, selectedStoryIndex, stories.length]);

  useEffect(() => {
    const playViewerMusic = async () => {
      await stopViewerMusic();

      if (!selectedStory?.musicUrl) return;

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: selectedStory.musicUrl },
          { shouldPlay: true, volume: 0.72, isLooping: true },
        );
        viewerSoundRef.current = sound;
      } catch (error) {
        console.log("Viewer music play error:", error);
      }
    };

    void playViewerMusic();
  }, [selectedStory?.id, selectedStory?.musicUrl, stopViewerMusic]);

  const resetStoryComposer = () => {
    setPendingStoryImageUri(null);
    setActiveStoryTool("text");
    setStoryCaption("");
    setStoryMusicTitle("");
    setStoryMusicArtist("");
    setStoryMusicUrl("");
    setMusicSearch("");
    setStoryLocationName("");
    setLocationSearch("");
    setShowStoryTimestamp(true);
    setLocatingStory(false);
    void stopPreviewMusic();
  };

  const handleAddStory = async () => {
    if (uploadingStory) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "\u0130zin gerekli",
        "Story payla\u015fmak i\u00e7in galeri izni vermelisin.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.85,
    });

    const imageUri = result.assets?.[0]?.uri;
    if (result.canceled || !imageUri) return;

    resetStoryComposer();
    setPendingStoryImageUri(imageUri);
  };

  const handleUseCurrentLocation = async () => {
    if (locatingStory) return;

    setLocatingStory(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "\u0130zin gerekli",
          "Mekan eklemek i\u00e7in konum izni vermelisin.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const formattedAddress = address
        ? formatAddress(address)
        : `${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`;

      setStoryLocationName(formattedAddress);
      setLocationSearch(formattedAddress);
    } catch (error) {
      console.log("Story location error:", error);
      Alert.alert("Hata", "Mekan bilgisi al\u0131namad\u0131.");
    } finally {
      setLocatingStory(false);
    }
  };

  const handleSelectLocation = (locationName: string) => {
    if (locationName === "Bulundu\u011fum konum") {
      void handleUseCurrentLocation();
      return;
    }

    setStoryLocationName(locationName);
    setLocationSearch(locationName);
  };

  const handlePreviewMusic = async (track: MusicTrack) => {
    if (previewingMusicId === track.id) {
      await stopPreviewMusic();
      return;
    }

    await stopPreviewMusic();

    try {
      setPreviewingMusicId(track.id);
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true, volume: 0.82, isLooping: false },
      );
      previewSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void stopPreviewMusic();
        }
      });
    } catch (error) {
      console.log("Music preview error:", error);
      setPreviewingMusicId(null);
      Alert.alert("Hata", "M\u00fczik \u00f6nizlemesi a\u00e7\u0131lamad\u0131.");
    }
  };

  const handleSelectMusic = (track: MusicTrack) => {
    setStoryMusicTitle(track.title);
    setStoryMusicArtist(track.artist);
    setStoryMusicUrl(track.url);
  };

  const handleShareStory = async () => {
    if (!pendingStoryImageUri || uploadingStory) return;

    setUploadingStory(true);
    try {
      const story = await createStory({
        imageUri: pendingStoryImageUri,
        caption: storyCaption,
        musicTitle: storyMusicTitle,
        musicArtist: storyMusicArtist,
        musicUrl: storyMusicUrl,
        locationName: storyLocationName,
        showTimestamp: showStoryTimestamp,
      });
      setStories((currentStories) => [story, ...currentStories]);
      resetStoryComposer();
    } catch (error) {
      console.log("Story upload error:", error);
      Alert.alert("Hata", "Story payla\u015f\u0131lamad\u0131.");
    } finally {
      setUploadingStory(false);
    }
  };

  const handleDeleteStory = () => {
    if (!selectedStory || !selectedStory.createdByMe || deletingStory) return;

    Alert.alert("Story Sil", "Bu story silinsin mi?", [
      { text: "Vazge\u00e7", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          if (!selectedStory) return;

          const storyId = selectedStory.id;
          setDeletingStory(true);
          try {
            await deleteStory(storyId);
            setStories((currentStories) =>
              currentStories.filter((story) => story.id !== storyId),
            );
            closeStoryViewer();
          } catch (error) {
            console.log("Story delete error:", error);
            Alert.alert("Hata", "Story silinemedi.");
          } finally {
            setDeletingStory(false);
          }
        },
      },
    ]);
  };

  const openStory = (storyId: number) => {
    const storyIndex = stories.findIndex((story) => story.id === storyId);
    if (storyIndex >= 0) {
      setSelectedStoryIndex(storyIndex);
    }
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>AutoTrack</Text>

        <ScrollView
          horizontal
          contentContainerStyle={styles.storyRow}
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            style={styles.story}
            onPress={handleAddStory}
            disabled={uploadingStory}
          >
            <View style={[styles.storyImage, styles.addStoryImage]}>
              {uploadingStory ? (
                <ActivityIndicator size="small" color="#202124" />
              ) : (
                <Ionicons name="add" size={28} color="#202124" />
              )}
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
              Story Ekle
            </Text>
          </Pressable>

          {stories.map((story) => (
            <Pressable
              style={styles.story}
              key={story.id}
              onPress={() => openStory(story.id)}
            >
              <Image
                source={{ uri: getSecureImageUrl(story.imageUrl) }}
                style={styles.storyImage}
                contentFit="cover"
              />
              <Text style={styles.storyName} numberOfLines={1}>
                {getStoryName(story)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              defaultAvatar={defaultAvatar}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>
            {"Hen\u00fcz kimse bir \u015fey payla\u015fmam\u0131\u015f."}
          </Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={resetStoryComposer}
        visible={pendingStoryImageUri !== null}
      >
        <SafeAreaView style={styles.composerSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.composerAvoidingView}
          >
            <View style={styles.composerCanvas}>
              {pendingStoryImageUri ? (
                <Image
                  source={{ uri: pendingStoryImageUri }}
                  style={styles.composerImage}
                  contentFit="cover"
                />
              ) : null}

              <View style={styles.composerShade} />

              <View style={styles.composerHeaderOverlay}>
                <Pressable
                  onPress={resetStoryComposer}
                  style={styles.roundIconButton}
                >
                  <Ionicons name="close" size={22} color="#ffffff" />
                </Pressable>
                <Text style={styles.composerHeaderTitle}>Story</Text>
                <Pressable
                  onPress={handleShareStory}
                  style={[styles.publishPill, uploadingStory && styles.disabledButton]}
                  disabled={uploadingStory}
                >
                  {uploadingStory ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.publishPillText}>Payla\u015f</Text>
                  )}
                </Pressable>
              </View>

              <View style={styles.composerToolRail}>
                {STORY_TOOLS.map((tool) => (
                  <Pressable
                    key={tool.key}
                    onPress={() => {
                      if (tool.key === "time") {
                        setShowStoryTimestamp((current) => !current);
                      }
                      setActiveStoryTool(tool.key);
                    }}
                    style={[
                      styles.composerToolButton,
                      activeStoryTool === tool.key && styles.composerToolButtonActive,
                    ]}
                  >
                    <Ionicons name={tool.icon} size={20} color="#ffffff" />
                    <Text style={styles.composerToolLabel}>{tool.label}</Text>
                  </Pressable>
                ))}
              </View>

              {storyCaption.trim() ? (
                <View style={styles.composerTextSticker}>
                  <Text style={styles.composerTextStickerText}>
                    {storyCaption.trim()}
                  </Text>
                </View>
              ) : null}

              <View style={styles.composerStickerStack}>
                {storyMusicTitle.trim() ? (
                  <View style={styles.storyStickerBubble}>
                    <Ionicons name="musical-notes" size={15} color="#ffffff" />
                    <View style={styles.storyStickerTextBlock}>
                      <Text style={styles.storyStickerText} numberOfLines={1}>
                        {storyMusicTitle.trim()}
                      </Text>
                      {storyMusicArtist ? (
                        <Text style={styles.storyStickerSubText} numberOfLines={1}>
                          {storyMusicArtist}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {storyLocationName.trim() ? (
                  <View style={styles.storyStickerBubble}>
                    <Ionicons name="location" size={15} color="#ffffff" />
                    <Text style={styles.storyStickerText} numberOfLines={1}>
                      {storyLocationName.trim()}
                    </Text>
                  </View>
                ) : null}

                {showStoryTimestamp ? (
                  <View style={styles.storyStickerBubble}>
                    <Ionicons name="time" size={15} color="#ffffff" />
                    <Text style={styles.storyStickerText}>
                      {formatStoryClock(new Date().toISOString())}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.composerInputTray}>
                {activeStoryTool === "text" ? (
                  <TextInput
                    style={styles.storyInput}
                    placeholder="Bir sey yaz..."
                    placeholderTextColor="#d8d8dc"
                    value={storyCaption}
                    onChangeText={setStoryCaption}
                    maxLength={120}
                    multiline
                  />
                ) : null}

                {activeStoryTool === "music" ? (
                  <View style={styles.musicPickerPanel}>
                    <View style={styles.searchInputWrap}>
                      <Ionicons name="search" size={18} color="#cfd0d6" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Muzik ara"
                        placeholderTextColor="#cfd0d6"
                        value={musicSearch}
                        onChangeText={setMusicSearch}
                      />
                    </View>
                    {storyMusicTitle ? (
                      <View style={styles.selectedMusicBar}>
                        <Ionicons name="checkmark-circle" size={18} color="#c47a2d" />
                        <Text style={styles.selectedMusicText} numberOfLines={1}>
                          {selectedMusicLabel}
                        </Text>
                      </View>
                    ) : null}
                    <ScrollView
                      style={styles.musicList}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
                      {filteredMusicTracks.map((track) => {
                        const selectedTrack = storyMusicUrl === track.url;
                        const previewingTrack = previewingMusicId === track.id;

                        return (
                          <Pressable
                            key={track.id}
                            onPress={() => handleSelectMusic(track)}
                            style={[
                              styles.musicRow,
                              selectedTrack && styles.musicRowSelected,
                            ]}
                          >
                            <Pressable
                              onPress={() => void handlePreviewMusic(track)}
                              style={styles.musicPlayButton}
                            >
                              <Ionicons
                                name={previewingTrack ? "pause" : "play"}
                                size={17}
                                color="#ffffff"
                              />
                            </Pressable>
                            <View style={styles.musicMeta}>
                              <Text style={styles.musicTitle} numberOfLines={1}>
                                {track.title}
                              </Text>
                              <Text style={styles.musicArtist} numberOfLines={1}>
                                {track.artist} - {track.duration}
                              </Text>
                            </View>
                            {selectedTrack ? (
                              <Ionicons name="checkmark" size={20} color="#c47a2d" />
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}

                {activeStoryTool === "location" ? (
                  <View style={styles.locationPickerPanel}>
                    <Pressable
                      onPress={handleUseCurrentLocation}
                      style={styles.currentLocationButton}
                      disabled={locatingStory}
                    >
                      {locatingStory ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Ionicons name="navigate" size={18} color="#ffffff" />
                      )}
                      <Text style={styles.currentLocationText}>Mevcut konumu kullan</Text>
                    </Pressable>
                    <View style={styles.searchInputWrap}>
                      <Ionicons name="search" size={18} color="#cfd0d6" />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Mekan ara"
                        placeholderTextColor="#cfd0d6"
                        value={locationSearch}
                        onChangeText={setLocationSearch}
                      />
                    </View>
                    <ScrollView
                      style={styles.locationList}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
                      {filteredLocations.map((locationName) => {
                        const selectedLocation = storyLocationName === locationName;

                        return (
                          <Pressable
                            key={locationName}
                            onPress={() => handleSelectLocation(locationName)}
                            style={[
                              styles.locationRow,
                              selectedLocation && styles.locationRowSelected,
                            ]}
                          >
                            <Ionicons name="location" size={17} color="#ffffff" />
                            <Text style={styles.locationRowText} numberOfLines={1}>
                              {locationName}
                            </Text>
                            {selectedLocation ? (
                              <Ionicons name="checkmark" size={20} color="#c47a2d" />
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null}

                {activeStoryTool === "time" ? (
                  <View style={styles.timeTrayRow}>
                    <View>
                      <Text style={styles.timeTrayTitle}>Saat etiketi</Text>
                      <Text style={styles.timeTraySubtitle}>
                        {showStoryTimestamp ? "Story'de gorunuyor" : "Story'de gizli"}
                      </Text>
                    </View>
                    <Switch
                      value={showStoryTimestamp}
                      onValueChange={setShowStoryTimestamp}
                      trackColor={{ false: "#4a4b51", true: "#c47a2d" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                ) : null}
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={closeStoryViewer}
        transparent
        visible={selectedStory !== null}
      >
        <View style={styles.viewerBackdrop}>
          {selectedStory && selectedStoryIndex !== null ? (
            <>
              <Image
                source={{ uri: getSecureImageUrl(selectedStory.imageUrl) }}
                style={styles.viewerImage}
                contentFit="cover"
              />
              <View style={styles.viewerShade} />

              <View style={styles.viewerTapLayer}>
                <Pressable
                  onPress={handlePreviousStory}
                  style={styles.viewerTapZone}
                />
                <Pressable
                  onPress={handleNextStory}
                  style={styles.viewerTapZone}
                />
              </View>

              <View style={styles.viewerProgressRow}>
                {stories.map((story, index) => (
                  <View style={styles.viewerProgressTrack} key={story.id}>
                    <View
                      style={[
                        styles.viewerProgressFill,
                        index <= selectedStoryIndex && styles.viewerProgressFillActive,
                      ]}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.viewerHeader}>
                <Image
                  source={
                    selectedStory.authorProfilePhoto
                      ? { uri: getSecureImageUrl(selectedStory.authorProfilePhoto) }
                      : defaultAvatar
                  }
                  style={styles.viewerAvatar}
                  contentFit="cover"
                />
                <View style={styles.viewerAuthorBlock}>
                  <Text style={styles.viewerAuthorName} numberOfLines={1}>
                    {getStoryName(selectedStory)}
                  </Text>
                  <Text style={styles.viewerTime}>
                    {formatStoryTime(selectedStory.createdAt)}
                  </Text>
                </View>
                <Pressable onPress={closeStoryViewer} style={styles.viewerCloseButton}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </Pressable>
              </View>

              {selectedStory.caption ? (
                <View style={styles.viewerTextSticker}>
                  <Text style={styles.viewerTextStickerText}>
                    {selectedStory.caption}
                  </Text>
                </View>
              ) : null}

              <View style={styles.viewerStickerStack}>
                {selectedStory.musicTitle ? (
                  <View style={styles.storyStickerBubble}>
                    <Ionicons name="musical-notes" size={15} color="#ffffff" />
                    <View style={styles.storyStickerTextBlock}>
                      <Text style={styles.storyStickerText} numberOfLines={1}>
                        {selectedStory.musicTitle}
                      </Text>
                      {selectedStory.musicArtist ? (
                        <Text style={styles.storyStickerSubText} numberOfLines={1}>
                          {selectedStory.musicArtist}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {selectedStory.locationName ? (
                  <View style={styles.storyStickerBubble}>
                    <Ionicons name="location" size={15} color="#ffffff" />
                    <Text style={styles.storyStickerText} numberOfLines={1}>
                      {selectedStory.locationName}
                    </Text>
                  </View>
                ) : null}

                {selectedStory.showTimestamp !== false ? (
                  <View style={styles.storyStickerBubble}>
                    <Ionicons name="time" size={15} color="#ffffff" />
                    <Text style={styles.storyStickerText}>
                      {formatStoryClock(selectedStory.createdAt)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {selectedStory.createdByMe ? (
                <Pressable
                  onPress={handleDeleteStory}
                  style={styles.deleteStoryButton}
                  disabled={deletingStory}
                >
                  {deletingStory ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={17} color="#ffffff" />
                      <Text style={styles.deleteStoryText}>Sil</Text>
                    </>
                  )}
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addStoryImage: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderColor: "#f0b579",
    justifyContent: "center",
  },
  composerAvoidingView: {
    flex: 1,
  },
  composerCanvas: {
    backgroundColor: "#050506",
    flex: 1,
    overflow: "hidden",
  },
  composerHeaderOverlay: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 16,
    position: "absolute",
    right: 16,
    top: 14,
    zIndex: 5,
  },
  composerHeaderTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  composerImage: {
    height: "100%",
    width: "100%",
  },
  composerInputTray: {
    backgroundColor: "rgba(9, 10, 12, 0.76)",
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 8,
    borderWidth: 1,
    bottom: 20,
    left: 16,
    padding: 10,
    position: "absolute",
    right: 16,
    zIndex: 5,
  },
  composerSafeArea: {
    backgroundColor: "#050506",
    flex: 1,
  },
  composerShade: {
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  composerStickerStack: {
    bottom: 332,
    gap: 8,
    left: 18,
    position: "absolute",
    right: 96,
    zIndex: 3,
  },
  composerTextSticker: {
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 8,
    left: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
    right: 88,
    top: "40%",
    zIndex: 3,
  },
  composerTextStickerText: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
  },
  composerToolButton: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.44)",
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: 62,
  },
  composerToolButtonActive: {
    backgroundColor: "rgba(196, 122, 45, 0.9)",
    borderColor: "rgba(255, 255, 255, 0.32)",
  },
  composerToolLabel: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  composerToolRail: {
    gap: 10,
    position: "absolute",
    right: 14,
    top: 94,
    zIndex: 4,
  },
  content: {
    paddingBottom: 34,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  currentLocationButton: {
    alignItems: "center",
    backgroundColor: "rgba(196, 122, 45, 0.88)",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 12,
  },
  currentLocationText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },  deleteStoryButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(183, 57, 57, 0.92)",
    borderRadius: 8,
    bottom: 34,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 86,
    paddingHorizontal: 14,
    position: "absolute",
    zIndex: 4,
  },
  deleteStoryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.75,
  },
  emptyText: {
    color: "#a9a9ae",
    marginTop: 40,
    textAlign: "center",
  },
  locationTrayInput: {
    flex: 1,
  },
  locationTrayRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  locationList: {
    maxHeight: 160,
  },
  locationPickerPanel: {
    gap: 10,
  },
  locationRow: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 9,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  locationRowSelected: {
    backgroundColor: "rgba(196, 122, 45, 0.2)",
  },
  locationRowText: {
    color: "#ffffff",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  musicArtist: {
    color: "#bfc0c7",
    fontSize: 12,
    marginTop: 2,
  },
  musicList: {
    maxHeight: 176,
  },
  musicMeta: {
    flex: 1,
  },
  musicPickerPanel: {
    gap: 10,
  },
  musicPlayButton: {
    alignItems: "center",
    backgroundColor: "rgba(196, 122, 45, 0.9)",
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  musicRow: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 8,
  },
  musicRowSelected: {
    backgroundColor: "rgba(196, 122, 45, 0.2)",
  },
  musicTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },  logo: {
    color: "#c47a2d",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  publishPill: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 84,
    paddingHorizontal: 14,
  },
  publishPillText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  roundIconButton: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  searchInput: {
    color: "#ffffff",
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 38,
  },
  searchInputWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
  },
  selectedMusicBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    minHeight: 26,
  },
  selectedMusicText: {
    color: "#ffffff",
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
  },  story: {
    alignItems: "center",
    marginRight: 14,
    width: 72,
  },
  storyImage: {
    borderColor: "#c457a5",
    borderRadius: 8,
    borderWidth: 2,
    height: 58,
    width: 58,
  },
  storyInput: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    minHeight: 42,
    paddingHorizontal: 4,
  },
  storyName: {
    color: "#f2f2f4",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
    maxWidth: 70,
    textAlign: "center",
  },
  storyRow: {
    paddingBottom: 2,
    paddingRight: 10,
  },
  storyStickerBubble: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.56)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  storyStickerSubText: {
    color: "#d9d9df",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1,
  },
  storyStickerTextBlock: {
    flexShrink: 1,
  },  storyStickerText: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "900",
  },
  timeTrayRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeTraySubtitle: {
    color: "#d8d8dc",
    fontSize: 12,
    marginTop: 3,
  },
  timeTrayTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  trayActionButton: {
    alignItems: "center",
    backgroundColor: "rgba(196, 122, 45, 0.9)",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 46,
  },
  viewerAuthorBlock: {
    flex: 1,
    marginLeft: 10,
    marginRight: 12,
  },
  viewerAuthorName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  viewerAvatar: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  viewerBackdrop: {
    backgroundColor: "#050505",
    flex: 1,
  },
  viewerCloseButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  viewerHeader: {
    alignItems: "center",
    flexDirection: "row",
    left: 20,
    position: "absolute",
    right: 20,
    top: 56,
    zIndex: 4,
  },
  viewerImage: {
    height: "100%",
    width: "100%",
  },
  viewerProgressFill: {
    backgroundColor: "transparent",
    borderRadius: 2,
    height: "100%",
    width: "0%",
  },
  viewerProgressFillActive: {
    backgroundColor: "#ffffff",
    width: "100%",
  },
  viewerProgressRow: {
    flexDirection: "row",
    gap: 4,
    left: 14,
    position: "absolute",
    right: 14,
    top: 42,
    zIndex: 5,
  },
  viewerProgressTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.32)",
    borderRadius: 2,
    flex: 1,
    height: 3,
    overflow: "hidden",
  },
  viewerShade: {
    backgroundColor: "rgba(0, 0, 0, 0.14)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  viewerStickerStack: {
    bottom: 102,
    gap: 8,
    left: 22,
    position: "absolute",
    right: 22,
    zIndex: 3,
  },
  viewerTapLayer: {
    flexDirection: "row",
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  viewerTapZone: {
    flex: 1,
  },
  viewerTextSticker: {
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 8,
    left: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
    right: 22,
    top: "42%",
    zIndex: 3,
  },
  viewerTextStickerText: {
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
  },
  viewerTime: {
    color: "#d6d6d6",
    fontSize: 12,
    marginTop: 2,
  },
});